import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any, Literal

from pydantic import BaseModel, Field


AppleHealthRecordType = Literal[
    "sleep_session",
    "sleep_stage",
    "heart_rate",
    "resting_heart_rate",
    "walking_heart_rate",
    "heart_rate_variability",
    "respiratory_rate",
    "blood_oxygen",
    "workout",
    "workout_duration",
    "active_energy",
    "basal_energy",
    "steps",
    "distance_walking_running",
    "stand_hours",
    "body_weight",
    "mindfulness_minutes",
    "time_in_bed",
]


class AppleHealthRecordIn(BaseModel):
    source_record_id: str | None = None
    record_type: AppleHealthRecordType
    start_at: datetime | None = None
    end_at: datetime | None = None
    recorded_at: datetime | None = None
    unit: str | None = None
    value_num: Decimal | None = None
    value_text: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class AppleHealthImportIn(BaseModel):
    source: str = "apple_health"
    payload_version: str = "v1"
    import_batch_id: uuid.UUID | None = None
    records: list[AppleHealthRecordIn]


class AppleHealthImportOut(BaseModel):
    batch_id: uuid.UUID
    inserted: int
    duplicates: int
