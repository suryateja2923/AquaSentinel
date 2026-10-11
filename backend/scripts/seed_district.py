"""Seed one district and its water bodies from real data.
  python -m scripts.seed_district --state "Andhra Pradesh" --district Guntur --min-ha 5
Districts come from FAO GAUL (2015 boundaries: pre-2022 district map, so state this on stage).
Water bodies are auto-detected from JRC permanent water (>=70% occurrence). Replace/merge with the
ISRO NWIA atlas polygons (Bhuvan/VEDAS download) for official names and boundaries."""
import argparse
import json
import re

import ee

from app import gee
from app.firebase import get_db
from app.geo import validate_polygon

p = argparse.ArgumentParser()
p.add_argument("--state", required=True)
p.add_argument("--district", required=True)
p.add_argument("--min-ha", type=float, default=5)
a = p.parse_args()

gee.init_ee()
db = get_db()
fc = (ee.FeatureCollection("FAO/GAUL/2015/level2")
      .filter(ee.Filter.eq("ADM1_NAME", a.state)).filter(ee.Filter.eq("ADM2_NAME", a.district)))
dist = ee.Feature(fc.first())
dgeom = dist.geometry()
did = re.sub(r"[^a-z0-9]+", "-", a.district.lower()).strip("-")
db.collection("districts").document(did).set({
    "name": a.district, "state": a.state, "boundary": json.dumps(dgeom.simplify(200).getInfo()),
    "boundarySource": "FAO GAUL 2015 level2"})

occ = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").select("occurrence").gte(70).selfMask().clip(dgeom)
vec = occ.reduceToVectors(geometry=dgeom, scale=30, geometryType="polygon", eightConnected=True,
                          maxPixels=int(1e10), bestEffort=True, tileScale=4)
vec = vec.map(lambda f: f.set("areaHa", f.geometry().area(30).divide(10000))) \
         .filter(ee.Filter.gte("areaHa", a.min_ha)).sort("areaHa", False).limit(200)
n = 0
for i, f in enumerate(vec.getInfo()["features"], 1):
    g = ee.Geometry(f["geometry"]).simplify(15).getInfo()
    try:
        validate_polygon(g, 100000)
    except Exception as e:
        print("skip", i, e)
        continue
    db.collection("waterBodies").document(f"{did}-wb{i:03d}").set({
        "districtId": did, "districtName": a.district, "name": f"Water body {i:03d} ({round(f['properties']['areaHa'])} ha)",
        "geometry": json.dumps(g),  # JSON string: Firestore rejects nested arrays
        "boundarySource": "JRC GSW v1.4 occurrence>=70 (auto-detected)", "refAreaHa": round(f["properties"]["areaHa"], 1)})
    n += 1
print(f"Seeded district {did} with {n} water bodies")
