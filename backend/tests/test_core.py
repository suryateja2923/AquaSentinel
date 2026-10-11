import pytest
from pydantic import ValidationError

from app.audit import canonical_hash, verify_chain
from app.geo import GeoError, area_ha, validate_latlon, validate_polygon
from app.schemas import AnalysisRequest

SQUARE = {"type": "Polygon", "coordinates": [[[80.0, 16.0], [80.01, 16.0], [80.01, 16.01], [80.0, 16.01], [80.0, 16.0]]]}


def test_area_is_geodesic():
    g = validate_polygon(SQUARE, 50000)
    assert 100 < area_ha(g) < 130  # ~0.01 deg square near 16N is about 118 ha


def test_rejects_bowtie_and_non_india_and_huge():
    bow = {"type": "Polygon", "coordinates": [[[80, 16], [80.01, 16.01], [80.01, 16], [80, 16.01], [80, 16]]]}
    with pytest.raises(GeoError):
        validate_polygon(bow, 50000)
    with pytest.raises(GeoError):
        validate_latlon(51.5, -0.1)
    with pytest.raises(GeoError):
        validate_polygon(SQUARE, 10)
    with pytest.raises(GeoError):
        validate_polygon({"type": "Point", "coordinates": [80, 16]}, 50000)


def test_analysis_request_rules():
    ok = {"waterBodyId": "lake_1", "baseline": {"year": 2020, "season": "dry"}, "comparison": {"year": 2024, "season": "dry"}}
    AnalysisRequest(**ok)
    with pytest.raises(ValidationError):
        AnalysisRequest(**{**ok, "comparison": {"year": 2024, "season": "post_monsoon"}})  # mixed seasons
    with pytest.raises(ValidationError):
        AnalysisRequest(**{**ok, "baseline": {"year": 2025, "season": "dry"}})            # reversed years
    with pytest.raises(ValidationError):
        AnalysisRequest(**{**ok, "waterBodyId": "../etc/passwd"})                          # id injection


def _chain(n):
    prev, out = "GENESIS", []
    for i in range(n):
        b = {"action": f"a{i}", "prev": prev}
        h = canonical_hash(b)
        out.append({**b, "hash": h})
        prev = h
    return out


def test_audit_chain_detects_edit():
    ev = _chain(5)
    assert verify_chain(ev)
    ev[2]["action"] = "forged"
    assert not verify_chain(ev)
