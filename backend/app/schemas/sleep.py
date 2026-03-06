import uuid
from datetime import date, datetime

from pydantic import BaseModel


class SleepSessionOut(BaseModel):
    id: uuid.UUID
    source: str
    start_at: datetime
    end_at: datetime
    duration_min: int
    time_in_bed_min: int | None
    sleep_efficiency: float | None
    bedtime: datetime | None
    wake_time: datetime | None

    model_config = {"from_attributes": True}


class SleepStageOut(BaseModel):
    id: uuid.UUID
    sleep_session_id: uuid.UUID
    stage_name: str
    start_at: datetime
    end_at: datetime
    duration_min: int

    model_config = {"from_attributes": True}


class SleepDailySummaryOut(BaseModel):
    date: date
    total_sleep_min: int
    total_time_in_bed_min: int
    deep_sleep_min: int
    rem_sleep_min: int
    awake_min: int
    sleep_efficiency: float | None
    bedtime: datetime | None
    wake_time: datetime | None
    bedtime_consistency_score: float
    sleep_score: float

    model_config = {"from_attributes": True}


class RecoveryDailyOut(BaseModel):
    date: date
    recovery_score: float
    sleep_component: float
    consistency_component: float
    training_load_component: float
    rhr_component: float
    hrv_component: float
    explanation: str

    model_config = {"from_attributes": True}
