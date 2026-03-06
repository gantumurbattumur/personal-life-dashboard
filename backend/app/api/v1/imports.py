import hashlib
import json
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.bronze import RawAppleHealthRecord
from app.schemas.imports import AppleHealthImportIn, AppleHealthImportOut
from app.security.dependencies import require_ingest_api_key

router = APIRouter(dependencies=[Depends(require_ingest_api_key)])


def _record_checksum(source: str, record: dict) -> str:
    digest_payload = {
        "source": source,
        "record_type": record.get("record_type"),
        "start_at": record.get("start_at"),
        "end_at": record.get("end_at"),
        "recorded_at": record.get("recorded_at"),
        "unit": record.get("unit"),
        "value_num": str(record.get("value_num")) if record.get("value_num") is not None else None,
        "value_text": record.get("value_text"),
        "metadata": record.get("metadata") or {},
    }
    raw = json.dumps(digest_payload, sort_keys=True, default=str)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


@router.post("/apple-health", response_model=AppleHealthImportOut, status_code=201)
async def import_apple_health_records(
    payload: AppleHealthImportIn,
    db: AsyncSession = Depends(get_db),
):
    batch_id = payload.import_batch_id or uuid.uuid4()
    inserted = 0
    duplicates = 0

    for incoming in payload.records:
        record_data = incoming.model_dump(mode="json")
        checksum = _record_checksum(payload.source, record_data)

        existing = None
        if incoming.source_record_id:
            existing = await db.scalar(
                select(RawAppleHealthRecord.id).where(
                    RawAppleHealthRecord.source == payload.source,
                    RawAppleHealthRecord.source_record_id == incoming.source_record_id,
                )
            )

        if not existing:
            existing = await db.scalar(
                select(RawAppleHealthRecord.id).where(
                    RawAppleHealthRecord.source == payload.source,
                    RawAppleHealthRecord.checksum == checksum,
                )
            )

        if existing:
            duplicates += 1
            continue

        raw_record = RawAppleHealthRecord(
            source=payload.source,
            import_batch_id=batch_id,
            source_record_id=incoming.source_record_id,
            record_type=incoming.record_type,
            start_at=incoming.start_at,
            end_at=incoming.end_at,
            recorded_at=incoming.recorded_at,
            unit=incoming.unit,
            value_num=float(incoming.value_num) if incoming.value_num is not None else None,
            value_text=incoming.value_text,
            checksum=checksum,
            payload_version=payload.payload_version,
            payload=record_data,
        )
        db.add(raw_record)
        inserted += 1

    await db.flush()
    return AppleHealthImportOut(batch_id=batch_id, inserted=inserted, duplicates=duplicates)
