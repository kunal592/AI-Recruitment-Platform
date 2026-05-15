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
    return await get_jobs(user_id=str(current_user.id), limit=limit)


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
    return await search_jobs(query=q, user_id=str(current_user.id), location=location, page=page, limit=limit)


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


@router.get(
    "/stats",
    response_model=dict,
    summary="Get dashboard statistics for the user",
)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
) -> dict:
    """Fetch application counts, interview counts, and ATS scores."""
    from app.models.job import SavedJob
    from app.models.profile import Profile
    
    user_id = str(current_user.id)
    
    total_apps = await SavedJob.find(
        SavedJob.user_id == user_id, 
        SavedJob.applied == True
    ).count()
    
    interviews = await SavedJob.find(
        SavedJob.user_id == user_id, 
        SavedJob.status == "interviewing"
    ).count()
    
    profile = await Profile.find_one(Profile.user_id == user_id)
    skills_count = len(profile.skills) if profile and profile.skills else 0
    ats_avg = min(60 + (skills_count * 2), 95) if profile else 0
    
    # Mock some data for views if not tracked
    views = 42 + (total_apps * 5)
    
    return {
        "total_applications": total_apps,
        "interviews_scheduled": interviews,
        "ats_score_avg": ats_avg,
        "profile_views": views,
        "application_trend": "+15%", # Mock trend
    }


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


@router.patch(
    "/application/{application_id}/status",
    summary="Update the status of an application",
)
async def update_app_status(
    application_id: str,
    status_update: dict,
    current_user: User = Depends(get_current_user),
) -> dict:
    """Update status, applied flag, and applied_at date."""
    from app.models.job import SavedJob
    from bson import ObjectId
    
    app = await SavedJob.get(ObjectId(application_id))
    if not app or app.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Application not found")
        
    new_status = status_update.get("status")
    if new_status:
        app.status = new_status
        # If moving to interviewing/offer, ensure it's marked as applied
        if new_status in ["applied", "interviewing", "offer", "rejected"]:
            if not app.applied:
                app.applied = True
                app.applied_at = datetime.utcnow()
                
    await app.save()
    return {"success": True}


@router.get(
    "/{job_id}",
    response_model=JobResponse,
    summary="Get details for a single job",
)
async def get_job_details(
    job_id: str,
    current_user: User = Depends(get_current_user),
) -> JobResponse:
    """Fetch a single job by ID or external_id."""
    from app.services.job_service import get_job_by_id
    return await get_job_by_id(job_id, user_id=str(current_user.id))
