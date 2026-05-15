"""
app/models/profile.py
─────────────────────────────────────────────────────────────────────────────
Extended user profile — skills, experience, education, preferences.
Linked 1-to-1 with the User document via user_id.
"""

from datetime import datetime
from typing import List, Optional

from beanie import Document
from pydantic import Field
from bson import ObjectId


class Experience(Document):
    """Embedded sub-document for a single work experience entry."""

    company: str
    role: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None  # None means "present"
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)

    class Settings:
        # Not a top-level collection — used as embedded model
        is_root: bool = False


class Education(Document):
    """Embedded sub-document for a single education entry."""

    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    gpa: Optional[float] = None

    class Settings:
        is_root: bool = False


class Profile(Document):
    """Full profile of a user, including skills and experience."""

    user_id: str  # References User.id as string
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None

    # Skill tags (plain strings)
    skills: List[str] = Field(default_factory=list)
    preferred_job_titles: List[str] = Field(default_factory=list)
    preferred_locations: List[str] = Field(default_factory=list)
    experience_years: int = 0

    # Embedded sub-documents stored as plain dicts for flexibility
    experience: List[dict] = Field(default_factory=list)
    education: List[dict] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    projects: List[dict] = Field(default_factory=list)
    ai_preferences: dict = Field(default_factory=lambda: {
        "auto_apply": False,
        "optimization_level": "Balanced",
        "match_threshold": 90
    })

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "profiles"
        indexes = ["user_id"]
