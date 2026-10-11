from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, model_validator

Season = Literal["dry", "post_monsoon", "pre_monsoon"]
ID = r"^[A-Za-z0-9_-]{2,80}$"


class Period(BaseModel):
    year: int = Field(ge=2018)
    season: Season


class AnalysisRequest(BaseModel):
    waterBodyId: str = Field(pattern=ID)
    baseline: Period
    comparison: Period
    method: Literal["mndwi", "ndwi"] = "mndwi"
    minHotspotHa: float = Field(0.5, ge=0.1, le=50)

    @model_validator(mode="after")
    def _rules(self):
        if self.baseline.season != self.comparison.season:
            raise ValueError("Compare the same season in both periods (e.g. dry vs dry)")
        if self.baseline.year >= self.comparison.year:
            raise ValueError("Baseline year must be earlier than the comparison year")
        if self.comparison.year > date.today().year:
            raise ValueError("Comparison year is in the future")
        return self


class CaseCreate(BaseModel):
    districtId: str = Field(pattern=ID)
    title: str = Field(min_length=3, max_length=140)
    lat: float
    lon: float
    relatedWaterBodyIds: list[str] = Field(default_factory=list, max_length=10)
    analysisId: str | None = Field(default=None, pattern=ID)
    notes: str = Field("", max_length=2000)


class ReportRequest(BaseModel):
    analysisId: str = Field(pattern=ID)
