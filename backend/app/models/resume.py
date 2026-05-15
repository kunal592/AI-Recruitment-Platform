"""
app/models/resume.py
─────────────────────────────────────────────────────────────────────────────
Tracks every resume uploaded by a user — raw text, AI-parsed data,
and the path to the stored file.
"""

from datetime import datetime
from typing import List, Optional

from beanie import Document
from pydantic import Field


class Resume(Document):
    """Stores resume file metadata + AI-parsed structured content."""

    user_id: str  # References User.id
    original_filename: str
    file_path: str          # Server-side path relative to UPLOAD_DIR
    file_type: str          # "pdf" | "docx"
    file_size_bytes: int

    # ── AI-Parsed fields (populated after Gemini analysis) ──────────────────
    raw_text: Optional[str] = None
    parsed_name: Optional[str] = None
    parsed_email: Optional[str] = None
    parsed_phone: Optional[str] = None
    parsed_skills: List[str] = Field(default_factory=list)
    parsed_education: List[dict] = Field(default_factory=list)
    parsed_experience: List[dict] = Field(default_factory=list)
    parsed_projects: List[dict] = Field(default_factory=list)
    parsed_certifications: List[str] = Field(default_factory=list)
    parsed_summary: Optional[str] = None

    is_parsed: bool = False
    is_active: bool = True  # Most recent / selected resume

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "resumes"
        indexes = ["user_id"]
