"""Ingestion endpoints — Bronze layer.

Accept raw data from external sources and store as JSONB.
"""

import csv
import io

from fastapi import APIRouter, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from app.database import get_db
from app.models.bronze import RawFinance, RawHealth, RawLocation, RawMedia
from app.schemas.bronze import CSVUploadResponse, HealthPayload, LocationPayload

router = APIRouter()


@router.post("/health", status_code=201)
async def ingest_health(
    payload: HealthPayload,
    db: AsyncSession = Depends(get_db),
):
    """Accepts Apple Health Auto Export JSON payloads."""
    record = RawHealth(
        source="apple_health",
        payload=payload.model_dump(),
    )
    db.add(record)
    await db.flush()
    return {"id": str(record.id), "status": "ingested"}


@router.post("/location")
async def ingest_location(
    payload: LocationPayload,
    db: AsyncSession = Depends(get_db),
):
    """Accepts OwnTracks HTTP JSON payloads.

    Returns [] as OwnTracks expects an empty JSON array response.
    """
    if payload.type_ != "location":
        return []  # Ignore non-location payloads silently

    record = RawLocation(
        source="owntracks",
        payload=payload.model_dump(by_alias=True),
    )
    db.add(record)
    await db.flush()
    return []


@router.post("/finance/csv", response_model=CSVUploadResponse)
async def ingest_finance_csv(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Accepts bank statement CSV uploads."""
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files accepted")

    contents = await file.read()
    decoded = contents.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))

    count = 0
    for row in reader:
        record = RawFinance(
            source=f"csv:{file.filename}",
            payload=dict(row),
        )
        db.add(record)
        count += 1

    await db.flush()
    return CSVUploadResponse(
        rows_ingested=count,
        source=file.filename,
        message=f"Ingested {count} rows from {file.filename}",
    )


@router.post("/media/csv", response_model=CSVUploadResponse)
async def ingest_media_csv(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Accepts Letterboxd diary CSV exports."""
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files accepted")

    contents = await file.read()
    decoded = contents.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))

    count = 0
    for row in reader:
        record = RawMedia(
            source="letterboxd",
            payload=dict(row),
        )
        db.add(record)
        count += 1

    await db.flush()
    return CSVUploadResponse(
        rows_ingested=count,
        source="letterboxd",
        message=f"Ingested {count} Letterboxd entries",
    )
