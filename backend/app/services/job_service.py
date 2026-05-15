"""
app/services/job_service.py
─────────────────────────────────────────────────────────────────────────────
Fetches job listings from RemoteOK and/or JSearch (RapidAPI),
caches them in MongoDB, and implements the skill-based recommendation engine.

Recommendation formula:
  score = (skill_match × 0.6) + (experience_match × 0.2) + (education_match × 0.2)
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx
from fastapi import HTTPException, status
from loguru import logger

from app.config.settings import settings
from app.models.job import Job, SavedJob
from app.models.profile import Profile
from app.schemas.job import JobRecommendation, JobResponse


# ─── RemoteOK Fetcher ─────────────────────────────────────────────────────────

async def fetch_remoteok_jobs(limit: int = 50) -> List[Dict[str, Any]]:
    """Pull jobs from the free RemoteOK API and normalise to our schema."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            settings.remoteok_api_url,
            headers={"User-Agent": "AI-Recruitment-Platform/1.0"},
        )
        resp.raise_for_status()

    raw_jobs = resp.json()
    jobs = []
    for item in raw_jobs[1:limit + 1]:  # Index 0 is a legal notice
        if not isinstance(item, dict):
            continue
        jobs.append({
            "external_id": str(item.get("id", "")),
            "source": "remoteok",
            "title": item.get("position", "Unknown"),
            "company": item.get("company", "Unknown"),
            "location": item.get("location", "Remote"),
            "job_type": "remote",
            "description": item.get("description", ""),
            "skills_required": item.get("tags", []),
            "apply_url": item.get("url", ""),
            "posted_at": item.get("date"),
        })
    return jobs


# ─── JSearch Fetcher (RapidAPI) ───────────────────────────────────────────────

async def fetch_jsearch_jobs(
    query: str,
    location: Optional[str] = None,
    page: int = 1,
) -> List[Dict[str, Any]]:
    """Search jobs via JSearch (RapidAPI). Requires JSEARCH_API_KEY."""
    if not settings.jsearch_api_key:
        logger.warning("JSEARCH_API_KEY not set — skipping JSearch.")
        return []

    params = {
        "query": f"{query} {location or ''}".strip(),
        "page": str(page),
        "num_pages": "1",
    }
    headers = {
        "X-RapidAPI-Key": settings.jsearch_api_key,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            "https://jsearch.p.rapidapi.com/search",
            params=params,
            headers=headers,
        )
        resp.raise_for_status()

    data = resp.json().get("data", [])
    jobs = []
    for item in data:
        jobs.append({
            "external_id": item.get("job_id", ""),
            "source": "jsearch",
            "title": item.get("job_title", ""),
            "company": item.get("employer_name", ""),
            "location": item.get("job_city") or item.get("job_country", ""),
            "job_type": item.get("job_employment_type", ""),
            "salary_min": item.get("job_min_salary"),
            "salary_max": item.get("job_max_salary"),
            "currency": item.get("job_salary_currency", "USD"),
            "description": item.get("job_description", ""),
            "skills_required": item.get("job_required_skills") or [],
            "apply_url": item.get("job_apply_link", ""),
            "posted_at": item.get("job_posted_at_datetime_utc"),
        })
    return jobs


# ─── DB helpers ───────────────────────────────────────────────────────────────

def _calculate_match_score(job_dict: dict, profile: Optional[Profile]) -> tuple[int, List[str], List[str]]:
    """Calculate match percentage and skill gaps for a job given a user profile."""
    if not profile:
        return 0, [], []
    
    user_skills = profile.skills or []
    job_skills = job_dict.get("skills_required", [])
    
    matching = []
    missing = []
    
    # Skill overlap
    if not job_skills:
        skill_score = 0.5
    else:
        user_set = {s.lower() for s in user_skills}
        job_set = {s.lower() for s in job_skills}
        matching = list(user_set & job_set)
        missing = [s for s in job_set if s.lower() not in user_set]
        skill_score = len(matching) / len(job_set)
        
    # Experience match
    experience_years = profile.experience_years or 0
    exp_score = min(experience_years / 3.0, 1.0)
    
    # Education match
    edu_score = 0.8 if profile.education else 0.2
    
    final_score = (skill_score * 0.6) + (exp_score * 0.2) + (edu_score * 0.2)
    return int(final_score * 100), matching, missing


def _job_dict_to_response(job_dict: dict, profile: Optional[Profile] = None) -> JobResponse:
    """Map a raw dict (from API or Mongo) to a JobResponse schema."""
    posted = job_dict.get("posted_at")
    if isinstance(posted, str):
        try:
            posted = datetime.fromisoformat(posted)
        except ValueError:
            posted = None
            
    match_percentage, matching, missing = _calculate_match_score(job_dict, profile)

    return JobResponse(
        id=str(job_dict.get("_id", "")),
        external_id=job_dict.get("external_id", ""),
        source=job_dict.get("source", ""),
        title=job_dict.get("title", ""),
        company=job_dict.get("company", ""),
        location=job_dict.get("location"),
        job_type=job_dict.get("job_type"),
        salary_min=job_dict.get("salary_min"),
        salary_max=job_dict.get("salary_max"),
        currency=job_dict.get("currency", "USD"),
        description=job_dict.get("description"),
        skills_required=job_dict.get("skills_required", []),
        apply_url=job_dict.get("apply_url"),
        posted_at=posted,
        match_percentage=match_percentage,
        matching_skills=matching,
        missing_skills=missing
    )


async def get_jobs(user_id: Optional[str] = None, limit: int = 20) -> List[JobResponse]:
    """Return cached jobs; refresh from RemoteOK if cache is empty."""
    count = await Job.count()
    if count == 0:
        logger.info("Job cache empty — fetching from RemoteOK …")
        raw_jobs = await fetch_remoteok_jobs(limit=100)
        for j in raw_jobs:
            exists = await Job.find_one(Job.external_id == j["external_id"])
            if not exists:
                await Job(**j).insert()

    jobs = await Job.find_all().limit(limit).to_list()
    profile = await Profile.find_one(Profile.user_id == user_id) if user_id else None
    return [_job_dict_to_response(j.model_dump(), profile) for j in jobs]


async def search_jobs(
    query: str,
    user_id: Optional[str] = None,
    location: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> List[JobResponse]:
    """Search jobs via JSearch (if key available) or fallback to RemoteOK."""
    raw = await fetch_jsearch_jobs(query=query, location=location, page=page)
    
    # If JSearch returned nothing (e.g. no key), try RemoteOK as a fallback
    if not raw:
        logger.info("JSearch returned no results — falling back to RemoteOK search heuristic.")
        all_remote = await fetch_remoteok_jobs(limit=100)
        # Simple filter heuristic for mock search
        raw = [
            j for j in all_remote 
            if query.lower() in j["title"].lower() or query.lower() in j["description"].lower()
        ][:limit]

    profile = await Profile.find_one(Profile.user_id == user_id) if user_id else None
    
    # Cache results to prevent 404 on details page
    for j in raw:
        exists = await Job.find_one(Job.external_id == j["external_id"])
        if not exists:
            # Add a flag or just insert
            await Job(**j).insert()
            
    return [_job_dict_to_response(j, profile) for j in raw]


async def get_job_by_id(job_id: str, user_id: Optional[str] = None) -> JobResponse:
    """Fetch a single job by ID (Mongo) or external_id."""
    from bson import ObjectId
    
    # Try Mongo ID first
    job = None
    if len(job_id) == 24:
        try:
            job = await Job.get(ObjectId(job_id))
        except:
            pass
            
    # Try external_id
    if not job:
        job = await Job.find_one(Job.external_id == job_id)
        
    if not job:
        # If not in cache, we'd ideally search specifically for it,
        # but for now, we'll return 404.
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found in cache."
        )
        
    profile = await Profile.find_one(Profile.user_id == user_id) if user_id else None
    return _job_dict_to_response(job.model_dump(), profile)


async def save_job(user_id: str, job_data: dict, notes: Optional[str] = None) -> SavedJob:
    """Bookmark a job for the user."""
    external_id = job_data.get("external_id", "")
    existing = await SavedJob.find_one(
        SavedJob.user_id == user_id,
        SavedJob.job_id == external_id,
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Job already saved.",
        )
    saved = SavedJob(
        user_id=user_id,
        job_id=external_id,
        job_data=job_data,
        notes=notes,
    )
    await saved.insert()
    return saved


async def get_saved_jobs(user_id: str) -> List[SavedJob]:
    """Return all jobs saved by the user."""
    return await SavedJob.find(SavedJob.user_id == user_id).to_list()


async def add_manual_application(user_id: str, payload: Any) -> SavedJob:
    """Add a manual job application entry."""
    job_data = {
        "title": payload.title,
        "company": payload.company,
        "location": payload.location or "Remote",
        "description": "Manual entry",
        "external_id": f"manual_{datetime.utcnow().timestamp()}",
        "source": "manual"
    }
    
    saved = SavedJob(
        user_id=user_id,
        job_id=job_data["external_id"],
        job_data=job_data,
        notes=payload.notes,
        applied=True,
        applied_at=datetime.utcnow(),
        status=payload.status,
        is_manual=True
    )
    await saved.insert()
    return saved


# ─── Recommendation Engine ────────────────────────────────────────────────────

def _skill_overlap(user_skills: List[str], job_skills: List[str]) -> tuple[float, List[str], List[str]]:
    """
    Compute Jaccard-style overlap between user skills and job required skills.

    Returns:
        (score 0-1, matching skills list, missing skills list)
    """
    if not job_skills:
        return 0.5, [], []  # No skill data — neutral score

    user_set = {s.lower() for s in user_skills}
    job_set = {s.lower() for s in job_skills}

    matching = list(user_set & job_set)
    missing = [s for s in job_set if s not in user_set]
    score = len(matching) / len(job_set)
    return score, matching, missing


async def get_job_recommendations(user_id: str, limit: int = 20) -> List[JobRecommendation]:
    """
    Score and rank all cached jobs for the user based on:
      score = (skill_match × 0.6) + (experience_match × 0.2) + (education_match × 0.2)
    """
    from app.models.profile import Profile

    profile = await Profile.find_one(Profile.user_id == user_id)
    user_skills = profile.skills if profile else []
    experience_years = profile.experience_years if profile else 0

    jobs = await Job.find_all().limit(200).to_list()
    recommendations = []

    for job in jobs:
        skill_score, matching, missing = _skill_overlap(
            user_skills, job.skills_required or []
        )

        # Heuristic experience match: assume most jobs need 2-5 years
        exp_score = min(experience_years / 3.0, 1.0)

        # Education match: simple boolean — has any education listed?
        edu_score = 0.8 if (profile and profile.education) else 0.2

        final_score = (skill_score * 0.6) + (exp_score * 0.2) + (edu_score * 0.2)

        recommendations.append(
            JobRecommendation(
                job=_job_dict_to_response(job.model_dump()),
                match_score=round(final_score, 4),
                match_percentage=int(final_score * 100),
                missing_skills=[s for s in missing],
                matching_skills=[s for s in matching],
            )
        )

    # Sort by match score descending
    recommendations.sort(key=lambda r: r.match_score, reverse=True)
    return recommendations[:limit]
