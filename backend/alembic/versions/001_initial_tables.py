"""initial bronze and silver tables

Revision ID: 001
Revises: None
Create Date: 2026-03-06
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Bronze tables ---
    op.create_table(
        "raw_health",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("source", sa.String(64), nullable=False),
        sa.Column("payload", postgresql.JSONB(), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_raw_health")),
    )

    op.create_table(
        "raw_finance",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("source", sa.String(64), nullable=False),
        sa.Column("payload", postgresql.JSONB(), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_raw_finance")),
    )

    op.create_table(
        "raw_media",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("source", sa.String(64), nullable=False),
        sa.Column("payload", postgresql.JSONB(), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_raw_media")),
    )

    op.create_table(
        "raw_location",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("source", sa.String(64), nullable=False),
        sa.Column("payload", postgresql.JSONB(), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_raw_location")),
    )

    # --- Silver tables ---
    op.create_table(
        "health_metrics",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("steps", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("sleep_minutes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("resting_hr", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("active_calories", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_health_metrics")),
    )
    op.create_index(op.f("ix_health_metrics_date"), "health_metrics", ["date"])

    op.create_table(
        "transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("category", sa.String(64), nullable=False, server_default="uncategorized"),
        sa.Column("merchant", sa.String(128), nullable=False, server_default=""),
        sa.Column("is_expense", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_transactions")),
    )
    op.create_index(op.f("ix_transactions_date"), "transactions", ["date"])

    op.create_table(
        "media_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("media_type", sa.String(32), nullable=False, server_default="movie"),
        sa.Column("title", sa.String(256), nullable=False),
        sa.Column("rating", sa.Float(), nullable=True),
        sa.Column("consumed_at", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_media_logs")),
    )
    op.create_index(op.f("ix_media_logs_consumed_at"), "media_logs", ["consumed_at"])

    op.create_table(
        "location_pings",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("lat", sa.Float(), nullable=False),
        sa.Column("lng", sa.Float(), nullable=False),
        sa.Column("accuracy", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_location_pings")),
    )
    op.create_index(op.f("ix_location_pings_timestamp"), "location_pings", ["timestamp"])

    op.create_table(
        "goals",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("title", sa.String(256), nullable=False),
        sa.Column("target", sa.Float(), nullable=False),
        sa.Column("current", sa.Float(), nullable=False, server_default="0"),
        sa.Column("unit", sa.String(32), nullable=False, server_default=""),
        sa.Column("deadline", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_goals")),
    )

    op.create_table(
        "habits",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("streak", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_completed", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_habits")),
    )


def downgrade() -> None:
    op.drop_table("habits")
    op.drop_table("goals")
    op.drop_index(op.f("ix_location_pings_timestamp"), table_name="location_pings")
    op.drop_table("location_pings")
    op.drop_index(op.f("ix_media_logs_consumed_at"), table_name="media_logs")
    op.drop_table("media_logs")
    op.drop_index(op.f("ix_transactions_date"), table_name="transactions")
    op.drop_table("transactions")
    op.drop_index(op.f("ix_health_metrics_date"), table_name="health_metrics")
    op.drop_table("health_metrics")
    op.drop_table("raw_location")
    op.drop_table("raw_media")
    op.drop_table("raw_finance")
    op.drop_table("raw_health")
