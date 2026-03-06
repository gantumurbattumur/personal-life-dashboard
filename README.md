# LifeOS — Personal Data Warehouse & Dashboard

A full-stack personal analytics platform that ingests data from your entire life
(health, finance, media, location, productivity) and visualizes it in a unified dashboard.

## Architecture

**Medallion Data Model:**

- **Bronze (Raw):** JSON webhooks and CSV uploads stored as JSONB
- **Silver (Clean):** Typed relational tables (health_metrics, transactions, media_logs, etc.)
- **Gold (Metrics):** Materialized views for instant dashboard loads

## Tech Stack

| Layer    | Technology                                     |
| -------- | ---------------------------------------------- |
| Backend  | Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic  |
| Database | PostgreSQL 16                                  |
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts |
| Maps     | React-Leaflet / Leaflet                        |
| Infra    | Docker Compose                                 |

## Quick Start

```bash
# 1. Clone and configure
cp .env.example .env

# 2. Start all services
docker compose up --build -d

# 3. Run database migrations
docker compose exec backend alembic upgrade head

# 4. Seed demo data
docker compose exec backend python -m app.seed

# 5. Open dashboard
open http://localhost:3000
```

## API Endpoints

### Ingestion (POST)
- `/api/v1/ingest/health` — Apple Health Auto Export JSON
- `/api/v1/ingest/location` — OwnTracks HTTP payload
- `/api/v1/ingest/finance/csv` — Bank statement CSV upload
- `/api/v1/ingest/media/csv` — Letterboxd diary CSV upload

### Dashboard (GET)
- `/api/v1/dashboard/today` — Today's combined stats
- `/api/v1/dashboard/map` — Last 100 location coordinates
- `/api/v1/dashboard/charts/finance` — Monthly income vs expenses
- `/api/v1/dashboard/charts/health` — 30-day health trends
- `/api/v1/dashboard/goals` — Yearly goals with progress
- `/api/v1/dashboard/habits` — Active habits with streaks
- `/api/v1/dashboard/media/recent` — Recently consumed media

## ETL Pipeline

Run the Bronze → Silver → Gold ETL manually or via cron:

```bash
docker compose exec backend python -m app.etl.runner
```

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/v1/          # FastAPI routers
│   │   ├── models/          # SQLAlchemy models (bronze/silver/gold)
│   │   ├── schemas/         # Pydantic request/response models
│   │   ├── etl/             # Bronze→Silver→Gold transforms
│   │   ├── config.py        # Settings
│   │   ├── database.py      # Async engine & session
│   │   └── main.py          # FastAPI app
│   └── alembic/             # Database migrations
├── frontend/
│   └── src/
│       ├── app/             # Next.js App Router pages
│       ├── components/      # React components
│       └── lib/             # API client & types
└── docker-compose.yml
```
