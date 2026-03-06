"""add lifeos sleep workout and apple health raw tables

Revision ID: 003
Revises: 002
Create Date: 2026-03-06
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "raw_apple_health_records",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("source", sa.String(length=64), nullable=False),
        sa.Column("import_batch_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("source_record_id", sa.String(length=128), nullable=True),
        sa.Column("record_type", sa.String(length=64), nullable=False),
        sa.Column("start_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("end_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("unit", sa.String(length=32), nullable=True),
        sa.Column("value_num", sa.Float(), nullable=True),
        sa.Column("value_text", sa.String(length=128), nullable=True),
        sa.Column("checksum", sa.String(length=64), nullable=False),
        sa.Column("payload_version", sa.String(length=16), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_raw_apple_health_records")),
    )
    op.create_index(op.f("ix_raw_apple_health_records_import_batch_id"), "raw_apple_health_records", ["import_batch_id"], unique=False)
    op.create_index(op.f("ix_raw_apple_health_records_record_type"), "raw_apple_health_records", ["record_type"], unique=False)
    op.create_index(op.f("ix_raw_apple_health_records_source_record_id"), "raw_apple_health_records", ["source_record_id"], unique=False)
    op.create_index(op.f("ix_raw_apple_health_records_checksum"), "raw_apple_health_records", ["checksum"], unique=False)

    op.create_table(
        "sleep_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("source", sa.String(length=64), nullable=False),
        sa.Column("start_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_min", sa.Integer(), nullable=False),
        sa.Column("time_in_bed_min", sa.Integer(), nullable=True),
        sa.Column("sleep_efficiency", sa.Float(), nullable=True),
        sa.Column("bedtime", sa.DateTime(timezone=True), nullable=True),
        sa.Column("wake_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("imported_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("raw_record_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sleep_sessions")),
    )
    op.create_index(op.f("ix_sleep_sessions_start_at"), "sleep_sessions", ["start_at"], unique=False)
    op.create_index(op.f("ix_sleep_sessions_end_at"), "sleep_sessions", ["end_at"], unique=False)
    op.create_index(op.f("ix_sleep_sessions_raw_record_id"), "sleep_sessions", ["raw_record_id"], unique=False)

    op.create_table(
        "sleep_stages",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("sleep_session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("stage_name", sa.String(length=16), nullable=False),
        sa.Column("start_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_min", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["sleep_session_id"], ["sleep_sessions.id"], name=op.f("fk_sleep_stages_sleep_session_id_sleep_sessions"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sleep_stages")),
    )
    op.create_index(op.f("ix_sleep_stages_sleep_session_id"), "sleep_stages", ["sleep_session_id"], unique=False)
    op.create_index(op.f("ix_sleep_stages_stage_name"), "sleep_stages", ["stage_name"], unique=False)

    op.create_table(
        "workout_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("source", sa.String(length=64), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("duration_min", sa.Integer(), nullable=True),
        sa.Column("workout_type", sa.String(length=64), nullable=True),
        sa.Column("location", sa.String(length=128), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("session_rpe", sa.Float(), nullable=True),
        sa.Column("calories_burned", sa.Float(), nullable=True),
        sa.Column("avg_heart_rate", sa.Float(), nullable=True),
        sa.Column("imported_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_workout_sessions")),
    )
    op.create_index(op.f("ix_workout_sessions_started_at"), "workout_sessions", ["started_at"], unique=False)
    op.create_index(op.f("ix_workout_sessions_workout_type"), "workout_sessions", ["workout_type"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_workout_sessions_workout_type"), table_name="workout_sessions")
    op.drop_index(op.f("ix_workout_sessions_started_at"), table_name="workout_sessions")
    op.drop_table("workout_sessions")

    op.drop_index(op.f("ix_sleep_stages_stage_name"), table_name="sleep_stages")
    op.drop_index(op.f("ix_sleep_stages_sleep_session_id"), table_name="sleep_stages")
    op.drop_table("sleep_stages")

    op.drop_index(op.f("ix_sleep_sessions_raw_record_id"), table_name="sleep_sessions")
    op.drop_index(op.f("ix_sleep_sessions_end_at"), table_name="sleep_sessions")
    op.drop_index(op.f("ix_sleep_sessions_start_at"), table_name="sleep_sessions")
    op.drop_table("sleep_sessions")

    op.drop_index(op.f("ix_raw_apple_health_records_checksum"), table_name="raw_apple_health_records")
    op.drop_index(op.f("ix_raw_apple_health_records_source_record_id"), table_name="raw_apple_health_records")
    op.drop_index(op.f("ix_raw_apple_health_records_record_type"), table_name="raw_apple_health_records")
    op.drop_index(op.f("ix_raw_apple_health_records_import_batch_id"), table_name="raw_apple_health_records")
    op.drop_table("raw_apple_health_records")
