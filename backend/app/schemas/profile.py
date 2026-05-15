"""
app/schemas/profile.py
─────────────────────────────────────────────────────────────────────────────
Pydantic schemas for user profile CRUD.
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class ExperienceSchema(BaseModel):
    company: str
    role: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)


class EducationSchema(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    gpa: Optional[float] = None


class ProjectSchema(BaseModel):
    name: str
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    url: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    """PUT /profile — all fields optional for partial updates."""

    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    skills: Optional[List[str]] = None
    preferred_job_titles: Optional[List[str]] = None
    preferred_locations: Optional[List[str]] = None
    experience_years: Optional[int] = None
    experience: Optional[List[ExperienceSchema]] = None
    education: Optional[List[EducationSchema]] = None
    certifications: Optional[List[str]] = None
    projects: Optional[List[ProjectSchema]] = None


class SkillsUpdateRequest(BaseModel):
    """POST /profile/skills — replace the entire skills list."""

    skills: List[str] = Field(..., min_length=1)


class ProfileResponse(BaseModel):
    """Full profile returned from GET /profile."""

    user_id: str
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    skills: List[str] = []
    preferred_job_titles: List[str] = []
    preferred_locations: List[str] = []
    experience_years: int = 0
    experience: List[dict] = []
    education: List[dict] = []
    certifications: List[str] = []
    projects: List[dict] = []
