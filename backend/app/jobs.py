import json
import logging
from datetime import datetime, timezone

from firebase_admin import firestore

from . import gee
from .audit import canonical_hash, log_event
from .firebase import get_db

log = logging.getLogger("aquasentinel.jobs")


def _now():
    return datetime.now(timezone.utc)


def run_analysis(job_id: str) -> None:
    db = get_db()
    ref = db.collection("analysisJobs").document(job_id)

    @firestore.transactional
    def claim(tx):
        snap = ref.get(transaction=tx)
        if not snap.exists or snap.to_dict()["status"] != "queued":
            return None  # already taken: retries are idempotent
        tx.update(ref, {"status": "running", "startedAt": _now()})
        return snap.to_dict()

    job = claim(db.transaction())
    if not job:
        return
    try:
        gee.init_ee()
        wb = db.collection("waterBodies").document(job["waterBodyId"]).get().to_dict()
        result = gee.analyze(json.loads(wb["geometry"]), job["params"])
        hotspots = result.pop("hotspots")
        body = {**result, "jobId": job_id, "waterBodyId": job["waterBodyId"], "districtId": job["districtId"],
                "requestedBy": job["requestedBy"], "createdAt": _now(), "reviewStatus": "pending"}
        body["sha256"] = canonical_hash({**result, "hotspots": [{k: h[k] for k in ("label", "areaHa", "geometry")} for h in hotspots],
                                         "jobId": job_id, "params": job["params"]})
        batch = db.batch()
        batch.set(db.collection("analysisResults").document(job_id), body)
        for h in hotspots:
            batch.set(db.collection("hotspots").document(f"{job_id}-{h['label']}"),
                      {**h, "jobId": job_id, "districtId": job["districtId"], "waterBodyId": job["waterBodyId"],
                       "reviewStatus": "pending", "createdAt": _now()})
        batch.update(db.collection("waterBodies").document(job["waterBodyId"]), {"latest": {
            "jobId": job_id, "lossHa": result["persistentLossHa"], "changePercent": result["changePercent"],
            "confidence": result["confidence"], "at": _now()}})
        batch.update(ref, {"status": "completed", "completedAt": _now(), "hotspotCount": len(hotspots)})
        batch.commit()
        log_event(job["requestedBy"], "analysis.completed", "analysisJobs", job_id)
    except gee.InsufficientData as e:
        ref.update({"status": "insufficient_data", "message": str(e), "completedAt": _now()})
        log_event(job["requestedBy"], "analysis.insufficient", "analysisJobs", job_id, "insufficient_data")
    except Exception:
        log.exception("analysis %s failed", job_id)  # details stay in server logs only
        ref.update({"status": "failed", "errorCode": "ANALYSIS_FAILED", "completedAt": _now()})
        log_event(job["requestedBy"], "analysis.failed", "analysisJobs", job_id, "failed")
