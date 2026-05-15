"""
app/schemas/job.py
─────────────────────────────────────────────────────────────────────────────
Pydantic schemas for job listing, saving, and recommendation.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class JobResponse(BaseModel):
    """Single job listing."""

    id: Optional[str] = None
    external_id: str
    source: str
    title: str
    company: str
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    currency: str = "USD"
    description: Optional[str] = None
    skills_required: List[str] = []
    apply_url: Optional[str] = None
    posted_at: Optional[datetime] = None
    match_percentage: Optional[int] = 0
    matching_skills: List[str] = []
    missing_skills: List[str] = []


class JobSearchRequest(BaseModel):
    """Query params for GET /jobs/search."""

    query: str = Field(..., min_length=2, examples=["Python Developer"])
    location: Optional[str] = None
    job_type: Optional[str] = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=50)


class SaveJobRequest(BaseModel):
    """POST /jobs/save payload."""

    job_data: dict  # Full job snapshot
    notes: Optional[str] = None


class JobRecommendation(BaseModel):
    """Single job with a match score and gap analysis."""

    job: JobResponse
    match_score: float          # 0.0 – 1.0
    match_percentage: int       # 0 – 100
    missing_skills: List[str]
    matching_skills: List[str]


class SavedJobResponse(BaseModel):
    id: str
    job_data: dict
    notes: Optional[str] = None
    applied: bool
    applied_at: Optional[datetime] = None
    status: str
    is_manual: bool
    saved_at: datetime


class ManualApplicationRequest(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    status: str = "applied"
    notes: Optional[str] = None
    date: Optional[str] = None # ISO format


class RecommendationResponse(BaseModel):
    recommendations: List[JobRecommendation]
    total: int
