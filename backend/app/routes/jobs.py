"""
app/routes/jobs.py
─────────────────────────────────────────────────────────────────────────────
Job discovery, search, bookmark, and AI recommendation endpoints.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.job import (
    JobResponse,
    RecommendationResponse,
    SaveJobRequest,
    ManualApplicationRequest,
)
from app.services.job_service import (
    get_job_recommendations,
    get_jobs,
    get_saved_jobs,
    save_job,
    search_jobs,
    add_manual_application,
)

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get(
    "",
    response_model=List[JobResponse],
    summary="Fetch latest remote job listings",
)
async def list_jobs(
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
) -> List[JobResponse]:
    """
    Returns cached remote job listings.
    If the cache is empty, fetches from RemoteOK and populates it.
    """
    return await get_jobs(limit=limit)


@router.get(
    "/search",
    response_model=List[JobResponse],
    summary="Search jobs from JSearch (RapidAPI)",
)
async def search(
    q: str = Query(..., min_length=2, description="Job title or keyword"),
    location: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
) -> List[JobResponse]:
    """Search live job listings using the JSearch API."""
    return await search_jobs(query=q, location=location, page=page, limit=limit)


@router.get(
    "/recommendations",
    response_model=RecommendationResponse,
    summary="Get AI-matched job recommendations",
)
async def recommendations(
    limit: int = Query(default=10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
) -> RecommendationResponse:
    """
    Returns jobs ranked by a skill + experience + education match score.

    Score formula:
    - Skill match   × 0.60
    - Experience    × 0.20
    - Education     × 0.20
    """
    recs = await get_job_recommendations(str(current_user.id), limit=limit)
    return RecommendationResponse(recommendations=recs, total=len(recs))


@router.post(
    "/save",
    status_code=status.HTTP_201_CREATED,
    summary="Save / bookmark a job",
)
async def save_a_job(
    payload: SaveJobRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    """Save a job listing to the user's bookmarks."""
    saved = await save_job(str(current_user.id), payload.job_data, payload.notes)
    return {"success": True, "saved_job_id": str(saved.id)}


@router.get(
    "/saved",
    response_model=dict,
    summary="List all bookmarked jobs",
)
async def list_saved_jobs(
    current_user: User = Depends(get_current_user),
) -> dict:
    """Return all jobs the user has saved."""
    saved = await get_saved_jobs(str(current_user.id))
    jobs = [
        {
            "id": str(s.id),
            "job_data": s.job_data,
            "notes": s.notes,
            "applied": s.applied,
            "applied_at": s.applied_at.isoformat() if s.applied_at else None,
            "status": s.status,
            "is_manual": s.is_manual,
            "saved_at": s.saved_at.isoformat(),
        }
        for s in saved
    ]
    return {"saved_jobs": jobs, "total": len(jobs)}


@router.post(
    "/manual-application",
    status_code=status.HTTP_201_CREATED,
    summary="Add a manual job application entry",
)
async def add_manual_app(
    payload: ManualApplicationRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    """Manually add an application that was submitted outside the platform."""
    saved = await add_manual_application(str(current_user.id), payload)
    return {"success": True, "application_id": str(saved.id)}
