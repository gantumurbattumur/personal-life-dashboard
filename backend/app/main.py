from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import dashboard, ingest, imports, sleep, workouts
from app.database import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown — dispose connection pool
    await engine.dispose()


app = FastAPI(
    title="LifeOS API",
    description="Personal Data Warehouse — Medallion Architecture",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(ingest.router, prefix="/api/v1/ingest", tags=["Ingest"])
app.include_router(imports.router, prefix="/api/v1/import", tags=["Import"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(sleep.router, prefix="/api/v1/sleep", tags=["Sleep"])
app.include_router(workouts.router, prefix="/api/v1/workouts", tags=["Workouts"])


@app.get("/health")
async def healthcheck():
    return {"status": "ok"}
