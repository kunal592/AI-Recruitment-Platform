"""
app/models/job.py
─────────────────────────────────────────────────────────────────────────────
Job listings fetched from external APIs and saved-job bookmarks.
"""

from datetime import datetime
from typing import List, Optional

from beanie import Document, Indexed
from pydantic import Field


class Job(Document):
    """A job listing cached from an external API."""

    external_id: str            # ID from the originating API
    source: str                 # "remoteok" | "jsearch"
    title: str
    company: str
    location: Optional[str] = None
    job_type: Optional[str] = None  # "full-time" | "contract" | "part-time"
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    currency: str = "USD"
    description: Optional[str] = None
    skills_required: List[str] = Field(default_factory=list)
    apply_url: Optional[str] = None
    posted_at: Optional[datetime] = None
    fetched_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "jobs"
        indexes = ["external_id", "source", "title"]


class SavedJob(Document):
    """Records that a user has saved / liked a specific job."""

    user_id: str    # References User.id
    job_id: str     # References Job.id or external_id
    job_data: dict  # Snapshot of the job at save time
    notes: Optional[str] = None
    applied: bool = False
    applied_at: Optional[datetime] = None
    status: str = "applied"  # "applied", "interviewing", "offer", "rejected"
    is_manual: bool = False
    saved_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "saved_jobs"
        indexes = ["user_id", "job_id"]
