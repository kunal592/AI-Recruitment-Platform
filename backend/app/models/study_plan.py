"""
app/models/study_plan.py
─────────────────────────────────────────────────────────────────────────────
Stores AI-generated 30-day study roadmaps for users.
"""

from datetime import datetime
from typing import List, Optional

from beanie import Document
from pydantic import Field


class StudyPlan(Document):
    """AI-generated personalised study roadmap."""

    user_id: str
    target_role: str
    missing_skills: List[str] = Field(default_factory=list)
    duration_days: int = 30

    # List of { day_range, topic, resources, tasks }
    plan: List[dict] = Field(default_factory=list)
    raw_plan_text: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "study_plans"
        indexes = ["user_id"]
