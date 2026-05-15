"""
app/services/study_plan_service.py
─────────────────────────────────────────────────────────────────────────────
Generates AI-powered study plans and persists them for the user.
"""

from app.ai.gemini_service import generate_study_plan
from app.models.profile import Profile
from app.models.study_plan import StudyPlan
from app.schemas.ai import StudyPlanRequest, StudyPlanResponse


async def create_study_plan(
    user_id: str,
    payload: StudyPlanRequest,
) -> StudyPlanResponse:
    """
    Generate and store a personalised study roadmap.
    Uses the user's existing profile skills if none are provided.
    """
    # Fall back to profile skills if caller didn't send any
    current_skills = payload.current_skills
    if not current_skills:
        profile = await Profile.find_one(Profile.user_id == user_id)
        current_skills = profile.skills if profile else []

    result = await generate_study_plan(
        target_role=payload.target_role,
        current_skills=current_skills,
        duration_days=payload.duration_days,
    )

    plan_doc = StudyPlan(
        user_id=user_id,
        target_role=payload.target_role,
        missing_skills=result.get("missing_skills", []),
        duration_days=payload.duration_days,
        plan=result.get("plan", []),
        raw_plan_text=result.get("raw_plan_text", ""),
    )
    await plan_doc.insert()

    return StudyPlanResponse(
        target_role=payload.target_role,
        duration_days=payload.duration_days,
        missing_skills=result.get("missing_skills", []),
        plan=result.get("plan", []),
        raw_plan_text=result.get("raw_plan_text", ""),
    )


async def get_latest_study_plan(user_id: str) -> StudyPlan:
    """Retrieve the most recent study plan for the user."""
    return await StudyPlan.find(StudyPlan.user_id == user_id).sort("-created_at").first_or_none()
