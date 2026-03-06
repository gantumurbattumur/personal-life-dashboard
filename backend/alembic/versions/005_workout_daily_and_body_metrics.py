"""add workout daily summary and body metrics

Revision ID: 005
Revises: 004
Create Date: 2026-03-06
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "workout_daily_summary",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("workouts_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_duration_min", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_calories_burned", sa.Float(), nullable=False, server_default="0"),
        sa.Column("training_load", sa.Float(), nullable=False, server_default="0"),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_workout_daily_summary")),
        sa.UniqueConstraint("date", name=op.f("uq_workout_daily_summary_date")),
    )
    op.create_index(op.f("ix_workout_daily_summary_date"), "workout_daily_summary", ["date"], unique=True)

    op.create_table(
        "body_metrics",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("body_weight", sa.Float(), nullable=True),
        sa.Column("body_fat_pct", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("source", sa.String(length=64), nullable=False, server_default="manual"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_body_metrics")),
    )
    op.create_index(op.f("ix_body_metrics_date"), "body_metrics", ["date"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_body_metrics_date"), table_name="body_metrics")
    op.drop_table("body_metrics")

    op.drop_index(op.f("ix_workout_daily_summary_date"), table_name="workout_daily_summary")
    op.drop_table("workout_daily_summary")
