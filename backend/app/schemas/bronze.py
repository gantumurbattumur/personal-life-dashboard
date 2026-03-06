"""Pydantic schemas for Bronze (ingestion) endpoints."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


# --- Apple Health Auto Export ---
class HealthMetricData(BaseModel):
    date: str
    qty: float | None = None
    value: str | None = None  # for sleep_analysis


class HealthMetricEntry(BaseModel):
    name: str
    units: str = ""
    data: list[HealthMetricData] = []


class HealthWorkout(BaseModel):
    name: str = ""
    start: str = ""
    end: str = ""
    duration: float = 0.0
    activeEnergy: float = 0.0


class HealthPayloadData(BaseModel):
    metrics: list[HealthMetricEntry] = []
    workouts: list[HealthWorkout] = []


class HealthPayload(BaseModel):
    data: HealthPayloadData


# --- OwnTracks ---
class LocationPayload(BaseModel):
    type_: str = Field("location", alias="_type")
    lat: float
    lon: float
    tst: int  # Unix epoch seconds
    acc: float | None = None
    alt: float | None = None
    batt: int | None = None
    vel: int | None = None
    tid: str | None = None

    model_config = {"populate_by_name": True}


# --- CSV upload response ---
class CSVUploadResponse(BaseModel):
    rows_ingested: int
    source: str
    message: str = "OK"
