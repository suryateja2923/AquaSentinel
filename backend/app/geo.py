import json

from pyproj import Geod
from shapely.geometry import Point, shape
from shapely.validation import explain_validity

_GEOD = Geod(ellps="WGS84")
INDIA_BBOX = (67.0, 6.0, 98.5, 37.5)  # lon_min, lat_min, lon_max, lat_max


class GeoError(ValueError):
    pass


def validate_latlon(lat: float, lon: float) -> None:
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        raise GeoError("Latitude or longitude out of range")
    if not (INDIA_BBOX[0] <= lon <= INDIA_BBOX[2] and INDIA_BBOX[1] <= lat <= INDIA_BBOX[3]):
        raise GeoError("Coordinates are outside India")


def area_ha(geom) -> float:
    """Geodesic area in hectares (never treat degrees as metres)."""
    return abs(_GEOD.geometry_area_perimeter(geom)[0]) / 10_000


def validate_polygon(geojson: dict, max_ha: float):
    if not isinstance(geojson, dict) or geojson.get("type") not in {"Polygon", "MultiPolygon"}:
        raise GeoError("Geometry must be a Polygon or MultiPolygon")
    geom = shape(geojson)
    if not geom.is_valid:
        raise GeoError(f"Invalid geometry: {explain_validity(geom)}")
    minx, miny, maxx, maxy = geom.bounds
    validate_latlon(miny, minx)
    validate_latlon(maxy, maxx)
    if area_ha(geom) > max_ha:
        raise GeoError(f"Area exceeds the {int(max_ha)} ha limit")
    return geom


def nearest_water_body(lat: float, lon: float, bodies: list[dict]):
    """bodies: [{id, name, geometry(JSON string)}] -> (inside, nearest, approx_distance_m)"""
    pt = Point(lon, lat)
    best, best_d = None, float("inf")
    for b in bodies:
        g = shape(json.loads(b["geometry"]))
        if g.contains(pt):
            return True, b, 0.0
        d = g.distance(pt)
        if d < best_d:
            best, best_d = b, d
    if best is None:
        return False, None, None
    return False, best, round(best_d * 111_000, 0)  # degrees to metres, approximate
