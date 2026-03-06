"""add sleep daily summary and recovery tables

Revision ID: 004
Revises: 003
Create Date: 2026-03-06
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "sleep_daily_summary",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("total_sleep_min", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_time_in_bed_min", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("deep_sleep_min", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("rem_sleep_min", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("awake_min", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("sleep_efficiency", sa.Float(), nullable=True),
        sa.Column("bedtime", sa.DateTime(timezone=True), nullable=True),
        sa.Column("wake_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("bedtime_consistency_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("sleep_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("source_priority", sa.String(length=32), nullable=False, server_default="apple_health"),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sleep_daily_summary")),
        sa.UniqueConstraint("date", name=op.f("uq_sleep_daily_summary_date")),
    )
    op.create_index(op.f("ix_sleep_daily_summary_date"), "sleep_daily_summary", ["date"], unique=True)

    op.create_table(
        "recovery_daily",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("recovery_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("sleep_component", sa.Float(), nullable=False, server_default="0"),
        sa.Column("consistency_component", sa.Float(), nullable=False, server_default="0"),
        sa.Column("training_load_component", sa.Float(), nullable=False, server_default="0"),
        sa.Column("rhr_component", sa.Float(), nullable=False, server_default="0"),
        sa.Column("hrv_component", sa.Float(), nullable=False, server_default="0"),
        sa.Column("explanation", sa.Text(), nullable=False, server_default=""),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_recovery_daily")),
        sa.UniqueConstraint("date", name=op.f("uq_recovery_daily_date")),
    )
    op.create_index(op.f("ix_recovery_daily_date"), "recovery_daily", ["date"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_recovery_daily_date"), table_name="recovery_daily")
    op.drop_table("recovery_daily")

    op.drop_index(op.f("ix_sleep_daily_summary_date"), table_name="sleep_daily_summary")
    op.drop_table("sleep_daily_summary")
