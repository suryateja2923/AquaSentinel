"""Earth Engine analysis. Every number returned here is computed from real
Sentinel-2 L2A scenes; nothing is hard-coded or simulated."""
import json
from datetime import date

import ee

from .config import settings

# Same-season windows only. Monsoon (Jun-Sep) is excluded on purpose: cloud cover
# makes optical water mapping unreliable.
SEASONS = {
    "dry": ("02-01", "04-15"),
    "pre_monsoon": ("05-01", "06-10"),
    "post_monsoon": ("11-01", "12-31"),
}
MNDWI_T, NDWI_T = 0.0, 0.0   # starting thresholds; tune against labelled samples
MIN_OBS = 2                  # valid scenes needed per period
PERSIST_WATER, PERSIST_DRY = 0.6, 0.2


class InsufficientData(Exception):
    pass


def init_ee() -> bool:
    import os
    try:
        if settings.ee_key_file and os.path.exists(settings.ee_key_file):
            creds = ee.ServiceAccountCredentials(settings.ee_service_account, settings.ee_key_file)
            ee.Initialize(creds, project=settings.ee_project or "hackathon-system-489301")
            return True
        project_id = settings.ee_project or "hackathon-system-489301"
        ee.Initialize(project=project_id)
        return True
    except Exception as e:
        print(f"Earth Engine initialization note ({settings.ee_service_account}): {e}")
        return False


def _collection(geom, year: int, season: str):
    start, end = SEASONS[season]
    return (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(geom)
        .filterDate(f"{year}-{start}", f"{year}-{end}")
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 40))
    )


def _water_fn(method: str):
    def fn(img):
        scl = img.select("SCL")
        ok = (scl.neq(1).And(scl.neq(3)).And(scl.neq(8))
              .And(scl.neq(9)).And(scl.neq(10)).And(scl.neq(11)))  # shadow, cloud, cirrus, snow
        r = img.select(["B3", "B8", "B11"]).divide(10000).updateMask(ok)
        if method == "mndwi":
            w = r.normalizedDifference(["B3", "B11"]).gt(MNDWI_T)
        else:
            w = r.normalizedDifference(["B3", "B8"]).gt(NDWI_T)
        return w.rename("water").updateMask(ok)
    return fn


def _freq(geom, year, season, method):
    """Per-pixel share of VALID observations classified as water, plus valid count."""
    col = _collection(geom, year, season)
    water = col.map(_water_fn(method))
    return water.mean().rename("freq"), water.count().rename("n"), col


def _extent(freq, n):
    return freq.gte(0.5).updateMask(n.gte(MIN_OBS))


def _area_ha(mask_img, geom):
    area = ee.Image.pixelArea().divide(10_000).updateMask(mask_img)
    out = area.reduceRegion(ee.Reducer.sum(), geom, 10, maxPixels=int(1e10), tileScale=4)
    return ee.Number(out.get("area", 0))


def analyze(geojson: dict, req: dict) -> dict:
    geom = ee.Geometry(geojson).buffer(150)  # reference boundary + 150 m margin
    b, c, method = req["baseline"], req["comparison"], req["method"]

    bf, bn, bcol = _freq(geom, b["year"], b["season"], method)
    cf, cn, ccol = _freq(geom, c["year"], c["season"], method)
    n_base, n_cur = bcol.size().getInfo(), ccol.size().getInfo()
    if n_base < MIN_OBS or n_cur < MIN_OBS:
        raise InsufficientData(f"Only {n_base} baseline and {n_cur} comparison usable scenes (need {MIN_OBS}+).")

    b_ext, c_ext = _extent(bf, bn), _extent(cf, cn)
    loss = bf.gte(PERSIST_WATER).And(cf.lte(PERSIST_DRY)).And(bn.gte(MIN_OBS)).And(cn.gte(MIN_OBS))
    gain = cf.gte(PERSIST_WATER).And(bf.lte(PERSIST_DRY)).And(bn.gte(MIN_OBS)).And(cn.gte(MIN_OBS))
    loss, gain = loss.selfMask(), gain.selfMask()

    # Built-up conversion evidence (Dynamic World)
    def built(year, season):
        s, e = SEASONS[season]
        return (ee.ImageCollection("GOOGLE/DYNAMICWORLD/V1").filterBounds(geom)
                .filterDate(f"{year}-{s}", f"{year}-{e}").select("built").mean())
    built_new = built(c["year"], c["season"]).gt(0.4).And(built(b["year"], b["season"]).lt(0.2)).rename("built_new")

    # JRC long-term context (Landsat 1984-2021) for cross-source disagreement flag
    jrc = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").select("occurrence").gte(50)

    scalars = ee.Dictionary({
        "baseHa": _area_ha(b_ext, geom), "curHa": _area_ha(c_ext, geom),
        "lossHa": _area_ha(loss, geom), "gainHa": _area_ha(gain, geom),
        "jrcHa": _area_ha(jrc.selfMask(), geom),
    }).getInfo()

    base_ha, cur_ha = scalars["baseHa"], scalars["curHa"]
    pct = round((cur_ha - base_ha) / base_ha * 100, 2) if base_ha > 0 else None  # None, never invented

    vectors = loss.reduceToVectors(geometry=geom, scale=10, geometryType="polygon",
                                   eightConnected=True, maxPixels=int(1e10), bestEffort=False, tileScale=4)

    def enrich(f):
        g = f.geometry()
        bf_ = built_new.reduceRegion(ee.Reducer.mean(), g, 10, maxPixels=int(1e9))
        return f.set({"areaHa": g.area(1).divide(10_000),
                      "builtFrac": ee.Dictionary(bf_).get("built_new", 0),
                      "lon": g.centroid(1).coordinates().get(0), "lat": g.centroid(1).coordinates().get(1)})

    vectors = (vectors.map(enrich).filter(ee.Filter.gte("areaHa", req["minHotspotHa"]))
               .sort("areaHa", False).limit(100).getInfo())
    hotspots = []
    for i, f in enumerate(vectors["features"], 1):
        p = f["properties"]
        hotspots.append({
            "label": f"H-{i:03d}", "areaHa": round(p["areaHa"], 3),
            "centroid": {"lat": round(p["lat"], 6), "lon": round(p["lon"], 6)},
            "builtUpFraction": round(p.get("builtFrac") or 0, 3),
            "geometry": json.dumps(f["geometry"]),
            "priority": _priority(p["areaHa"], p.get("builtFrac") or 0),
        })

    disagree = scalars["jrcHa"] > 0 and abs(base_ha - scalars["jrcHa"]) / scalars["jrcHa"] > 0.3
    return {
        "baselineWaterHa": round(base_ha, 2), "comparisonWaterHa": round(cur_ha, 2),
        "netChangeHa": round(cur_ha - base_ha, 2), "changePercent": pct,
        "persistentLossHa": round(scalars["lossHa"], 2), "persistentGainHa": round(scalars["gainHa"], 2),
        "jrcPermanentWaterHa": round(scalars["jrcHa"], 2), "jrcDisagreement": bool(disagree),
        "validScenes": {"baseline": n_base, "comparison": n_cur},
        "confidence": _confidence(n_base, n_cur, disagree),
        "hotspots": hotspots,
        "trend": _trend(geom, c["year"], b["season"], method),
        "sources": ["COPERNICUS/S2_SR_HARMONIZED", "GOOGLE/DYNAMICWORLD/V1", "JRC/GSW1_4/GlobalSurfaceWater"],
        "methodVersion": settings.method_version,
        "method": {"index": method, "threshold": MNDWI_T if method == "mndwi" else NDWI_T,
                   "cloudFilterPct": 40, "minValidScenes": MIN_OBS, "scale_m": 10,
                   "persistence": {"waterFreq": PERSIST_WATER, "dryFreq": PERSIST_DRY}},
    }


def _priority(area_ha: float, built_frac: float) -> str:
    if built_frac >= 0.3 and area_ha >= 1:
        return "high"
    return "medium" if area_ha >= 1 or built_frac >= 0.1 else "low"


def _confidence(nb: int, nc: int, disagree: bool) -> str:
    m = min(nb, nc)
    if m >= 4 and not disagree:
        return "high"
    return "medium" if m >= 2 else "low"


def _trend(geom, last_year: int, season: str, method: str) -> list[dict]:
    feats = []
    for y in range(2018, min(last_year, date.today().year) + 1):
        f, n, col = _freq(geom, y, season, method)
        size = col.size()
        area = ee.Algorithms.If(size.gte(MIN_OBS), _area_ha(_extent(f, n), geom), -1)
        feats.append(ee.Feature(None, {"year": y, "ha": area, "scenes": size}))
    out = ee.FeatureCollection(feats).getInfo()["features"]
    return [{"year": o["properties"]["year"],
             "ha": None if o["properties"]["ha"] < 0 else round(o["properties"]["ha"], 2),
             "scenes": o["properties"]["scenes"]} for o in out]


def tile_urls(geojson: dict, req: dict) -> dict:
    """Short-lived map tile URLs (they expire); regenerate on every page view."""
    geom = ee.Geometry(geojson).buffer(150)
    out = {}
    for key, p in (("baseline", req["baseline"]), ("comparison", req["comparison"])):
        f, n, _ = _freq(geom, p["year"], p["season"], req["method"])
        img = _extent(f, n).selfMask()
        m = img.getMapId({"min": 0, "max": 1, "palette": ["1F8A9E"], "opacity": 0.75})
        out[key] = m["tile_fetcher"].url_format
    return out
