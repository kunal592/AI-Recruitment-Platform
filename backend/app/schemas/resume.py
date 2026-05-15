"""
app/schemas/resume.py
─────────────────────────────────────────────────────────────────────────────
Pydantic schemas for resume upload and retrieval.
"""

from typing import List, Optional

from pydantic import BaseModel


class ResumeResponse(BaseModel):
    """Returned after a successful upload + parse."""

    id: str
    user_id: str
    original_filename: str
    file_type: str
    file_size_bytes: int
    is_parsed: bool

    # AI-extracted fields
    parsed_name: Optional[str] = None
    parsed_email: Optional[str] = None
    parsed_phone: Optional[str] = None
    parsed_skills: List[str] = []
    parsed_education: List[dict] = []
    parsed_experience: List[dict] = []
    parsed_projects: List[dict] = []
    parsed_certifications: List[str] = []
    parsed_summary: Optional[str] = None
    raw_text: Optional[str] = None
