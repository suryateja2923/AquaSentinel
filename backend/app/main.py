import json
import time
import uuid
from collections import defaultdict, deque

import httpx
from fastapi import BackgroundTasks, Depends, FastAPI, File, HTTPException, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from firebase_admin import firestore

from . import gee, jobs, reports
from .audit import log_event, sha256_bytes
from .auth import User, current_user, require_district, require_write
from .config import settings
from .firebase import get_bucket, get_db
from .geo import GeoError, nearest_water_body, validate_latlon, validate_polygon
from .schemas import AnalysisRequest, CaseCreate, ReportRequest

app = FastAPI(title="AquaSentinel API", version="1.0", docs_url=None, redoc_url=None, openapi_url=None)
app.add_middleware(CORSMiddleware, allow_origins=settings.origins, allow_credentials=False,
                   allow_methods=["GET", "POST"], allow_headers=["Authorization", "Content-Type"], max_age=600)

_hits: dict[str, deque] = defaultdict(deque)


def rate_limit(key: str, limit: int, window: int = 60) -> None:
    """In-memory sliding window. Use Cloud Armor / Redis if you run more than one instance."""
    now, q = time.time(), _hits[key]
    while q and q[0] < now - window:
        q.popleft()
    if len(q) >= limit:
        raise HTTPException(429, "Too many requests. Wait a moment and try again")
    q.append(now)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    resp = await call_next(request)
    resp.headers.update({"X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY",
                         "Referrer-Policy": "no-referrer", "Cache-Control": "no-store",
                         "Strict-Transport-Security": "max-age=63072000; includeSubDomains"})
    return resp


@app.exception_handler(GeoError)
async def geo_error(_, e: GeoError):
    return JSONResponse({"detail": str(e)}, status_code=422)


def _doc(col: str, doc_id: str) -> dict:
    snap = get_db().collection(col).document(doc_id).get()
    if not snap.exists:
        raise HTTPException(404, "Not found")
    return {**snap.to_dict(), "id": snap.id}


def _clean(d: dict) -> dict:
    return json.loads(json.dumps(d, default=str))


@app.get("/api/v1/healthz")
def healthz():
    return {"ok": True}


@app.get("/api/v1/districts")
def districts(user: User = Depends(current_user)):
    col = get_db().collection("districts")
    docs = col.stream() if user.role == "admin" else (col.document(d).get() for d in user.districts)
    return [_clean({**s.to_dict(), "id": s.id}) for s in docs if s.exists]


@app.get("/api/v1/districts/{district_id}/water-bodies")
def water_bodies(district_id: str, user: User = Depends(current_user)):
    require_district(user, district_id)
    q = get_db().collection("waterBodies").where("districtId", "==", district_id).limit(500)
    return [_clean({**s.to_dict(), "id": s.id}) for s in q.stream()]


@app.get("/api/v1/water-bodies/{wb_id}")
def water_body(wb_id: str, user: User = Depends(current_user)):
    wb = _doc("waterBodies", wb_id)
    require_district(user, wb["districtId"])
    return _clean(wb)


@app.get("/api/v1/locate")
def locate(lat: float, lon: float, district_id: str, user: User = Depends(current_user)):
    require_district(user, district_id)
    rate_limit(f"loc:{user.uid}", 30)
    validate_latlon(lat, lon)
    bodies = [{**s.to_dict(), "id": s.id} for s in
              get_db().collection("waterBodies").where("districtId", "==", district_id).stream()]
    inside, nearest, dist = nearest_water_body(lat, lon, bodies)
    if not nearest:
        return {"inside": False, "nearest": None}
    return _clean({"inside": inside, "distanceM": dist,
                   "nearest": {k: v for k, v in nearest.items() if k != "geometry"}})


@app.get("/api/v1/geocode")
async def geocode(q: str = Query(min_length=3, max_length=100), user: User = Depends(current_user)):
    rate_limit(f"geo:{user.uid}", 20)  # Nominatim policy: max 1 req/s, identify the app
    async with httpx.AsyncClient(timeout=8) as c:
        r = await c.get("https://nominatim.openstreetmap.org/search",
                        params={"q": q, "format": "jsonv2", "countrycodes": "in", "limit": 5},
                        headers={"User-Agent": "AquaSentinel-hackathon/1.0 (contact: set-your-email)"})
    r.raise_for_status()
    return [{"name": x["display_name"], "lat": float(x["lat"]), "lon": float(x["lon"])} for x in r.json()]


@app.post("/api/v1/analyses", status_code=202)
def create_analysis(req: AnalysisRequest, bg: BackgroundTasks, user: User = Depends(current_user)):
    require_write(user)
    wb = _doc("waterBodies", req.waterBodyId)
    require_district(user, wb["districtId"])
    validate_polygon(json.loads(wb["geometry"]), settings.max_area_ha)
    rate_limit(f"an:{user.uid}", settings.max_analyses_per_hour, 3600)
    db = get_db()
    active = (db.collection("analysisJobs").where("requestedBy", "==", user.uid)
              .where("status", "in", ["queued", "running"]).limit(3).get())
    if len(active) >= 2:
        raise HTTPException(429, "You already have two analyses running")
    params = req.model_dump()
    job_id = uuid.uuid4().hex
    db.collection("analysisJobs").document(job_id).set({
        "requestedBy": user.uid, "waterBodyId": req.waterBodyId, "districtId": wb["districtId"],
        "status": "queued", "params": params, "methodVersion": settings.method_version,
        "createdAt": firestore.SERVER_TIMESTAMP})
    log_event(user.uid, "analysis.requested", "analysisJobs", job_id)
    bg.add_task(jobs.run_analysis, job_id)  # Hackathon: in-process. Production: Cloud Tasks -> Cloud Run job.
    return {"jobId": job_id, "status": "queued"}


def _job_for(job_id: str, user: User) -> dict:
    job = _doc("analysisJobs", job_id)
    require_district(user, job["districtId"])
    return job


@app.get("/api/v1/analyses/{job_id}")
def get_analysis(job_id: str, user: User = Depends(current_user)):
    job = _job_for(job_id, user)
    out = {"job": _clean(job)}
    if job["status"] == "completed":
        out["result"] = _clean(_doc("analysisResults", job_id))
        hs = get_db().collection("hotspots").where("jobId", "==", job_id).limit(100).stream()
        out["hotspots"] = [_clean({**h.to_dict(), "id": h.id}) for h in hs]
    return out


@app.get("/api/v1/analyses/{job_id}/tiles")
def analysis_tiles(job_id: str, user: User = Depends(current_user)):
    job = _job_for(job_id, user)
    if job["status"] != "completed":
        raise HTTPException(409, "Analysis is not finished")
    rate_limit(f"tiles:{user.uid}", 20)
    gee.init_ee()
    wb = _doc("waterBodies", job["waterBodyId"])
    return gee.tile_urls(json.loads(wb["geometry"]), job["params"])


@app.post("/api/v1/cases", status_code=201)
def create_case(body: CaseCreate, user: User = Depends(current_user)):
    require_write(user)
    require_district(user, body.districtId)
    validate_latlon(body.lat, body.lon)
    ref = get_db().collection("investigationCases").document()
    ref.set({**body.model_dump(), "createdBy": user.uid, "reviewStatus": "open",
             "createdAt": firestore.SERVER_TIMESTAMP, "updatedAt": firestore.SERVER_TIMESTAMP})
    log_event(user.uid, "case.created", "investigationCases", ref.id)
    return {"caseId": ref.id}


@app.get("/api/v1/cases/{case_id}")
def get_case(case_id: str, user: User = Depends(current_user)):
    c = _doc("investigationCases", case_id)
    require_district(user, c["districtId"])
    return _clean(c)


@app.post("/api/v1/reports", status_code=201)
def create_report(body: ReportRequest, user: User = Depends(current_user)):
    require_write(user)
    job = _job_for(body.analysisId, user)
    if job["status"] != "completed":
        raise HTTPException(409, "Analysis is not finished")
    db = get_db()
    result = _doc("analysisResults", body.analysisId)
    wb = _doc("waterBodies", job["waterBodyId"])
    hs = [h.to_dict() for h in db.collection("hotspots").where("jobId", "==", body.analysisId).limit(100).stream()]
    ref = db.collection("reports").document()
    pdf = reports.build_pdf(ref.id, wb, result, job["params"], sorted(hs, key=lambda h: -h["areaHa"]))
    digest = sha256_bytes(pdf)
    get_bucket().blob(f"reports/{ref.id}.pdf").upload_from_string(pdf, content_type="application/pdf")
    ref.set({"analysisId": body.analysisId, "districtId": job["districtId"], "createdBy": user.uid,
             "sha256": digest, "createdAt": firestore.SERVER_TIMESTAMP})
    log_event(user.uid, "report.created", "reports", ref.id)
    return {"reportId": ref.id, "sha256": digest}


@app.get("/api/v1/reports/{report_id}/download")
def download_report(report_id: str, user: User = Depends(current_user)):
    r = _doc("reports", report_id)
    require_district(user, r["districtId"])
    data = get_bucket().blob(f"reports/{report_id}.pdf").download_as_bytes()
    if sha256_bytes(data) != r["sha256"]:  # stored file was altered
        log_event(user.uid, "report.tamper_detected", "reports", report_id, "integrity_failure")
        raise HTTPException(409, "Stored report failed its integrity check")
    log_event(user.uid, "report.downloaded", "reports", report_id)
    return Response(data, media_type="application/pdf",
                    headers={"Content-Disposition": f'attachment; filename="aquasentinel-{report_id}.pdf"'})


# ---- Public verification: reveals only whether a file is genuine, never site data ----
@app.get("/api/v1/public/reports/{report_id}")
def public_report(report_id: str, request: Request):
    rate_limit(f"pub:{request.client.host}", 30)
    snap = get_db().collection("reports").document(report_id).get()
    if not snap.exists:
        raise HTTPException(404, "No report with this ID")
    d = snap.to_dict()
    return {"reportId": report_id, "createdAt": str(d["createdAt"]), "sha256": d["sha256"]}


@app.post("/api/v1/public/verify")
async def verify_pdf(request: Request, file: UploadFile = File(...)):
    rate_limit(f"ver:{request.client.host}", 10)
    data = await file.read(10 * 1024 * 1024 + 1)
    if len(data) > 10 * 1024 * 1024 or not data.startswith(b"%PDF"):
        raise HTTPException(422, "Upload the original PDF (max 10 MB)")
    q = get_db().collection("reports").where("sha256", "==", sha256_bytes(data)).limit(1).get()
    if not q:
        return {"verified": False}
    return {"verified": True, "reportId": q[0].id, "createdAt": str(q[0].to_dict()["createdAt"])}
