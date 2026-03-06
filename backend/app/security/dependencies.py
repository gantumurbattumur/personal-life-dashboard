from fastapi import Header, HTTPException, status

from app.config import settings


async def require_ingest_api_key(x_api_key: str | None = Header(default=None)) -> None:
    configured_key = settings.ingest_api_key
    if not configured_key:
        return

    if x_api_key != configured_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid ingestion API key",
        )
