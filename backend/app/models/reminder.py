"""
app/models/reminder.py
─────────────────────────────────────────────────────────────────────────────
Stores scheduled reminders (interview, follow-up, etc.) managed by APScheduler.
"""

from datetime import datetime
from typing import Optional

from beanie import Document
from pydantic import Field


class Reminder(Document):
    """A user-created reminder tracked in the DB and scheduled via APScheduler."""

    user_id: str
    title: str
    message: str
    reminder_type: str  # "interview" | "follow_up" | "application" | "custom"
    scheduled_at: datetime  # When the reminder should fire
    job_id: Optional[str] = None  # APScheduler job ID
    is_sent: bool = False
    is_cancelled: bool = False

    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "reminders"
        indexes = ["user_id", "scheduled_at"]
