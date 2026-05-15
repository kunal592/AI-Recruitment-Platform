"""
app/models/interview.py
─────────────────────────────────────────────────────────────────────────────
Tracks mock interview sessions: generated questions and user answers.
"""

from datetime import datetime
from typing import List, Optional

from beanie import Document
from pydantic import Field


class QAPair(dict):
    """Typed alias for a question-answer dict stored in MongoDB."""
    # { question: str, answer: str | None, evaluation: str | None, score: int | None }


class InterviewSession(Document):
    """A single mock interview session for a user."""

    user_id: str
    job_title: Optional[str] = None
    job_description: Optional[str] = None
    interview_type: str = "mixed"  # "technical" | "hr" | "mixed"

    # List of { question, answer, evaluation, score }
    qa_pairs: List[dict] = Field(default_factory=list)

    total_score: Optional[float] = None
    overall_feedback: Optional[str] = None
    completed: bool = False

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "interview_sessions"
        indexes = ["user_id"]
