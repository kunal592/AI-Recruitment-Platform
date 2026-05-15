"""
app/routes/ai_routes.py
─────────────────────────────────────────────────────────────────────────────
AI-powered feature endpoints:
  - Resume customisation / ATS optimisation
  - Professional email generation
  - Personalised study plan generation
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from loguru import logger

from app.ai.gemini_service import customize_resume, generate_email, generate_study_plan
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.ai import (
    CustomizeResumeRequest,
    CustomizeResumeResponse,
    GenerateEmailRequest,
    GenerateEmailResponse,
    StudyPlanRequest,
    StudyPlanResponse,
)
from app.services.resume_service import get_resume_by_id, get_user_active_resume
from app.services.study_plan_service import create_study_plan, get_latest_study_plan

router = APIRouter(prefix="/ai", tags=["AI Features"])



@router.get(
    "/latest-study-plan",
    summary="Get the user's most recent study plan",
)
async def get_latest_plan_endpoint(
    current_user: User = Depends(get_current_user),
):
    """Retrieve the last roadmap generated for the user."""
    try:
        plan = await get_latest_study_plan(str(current_user.id))
        if not plan:
            return JSONResponse(content=None)
        
        data = {
            "target_role": str(plan.target_role),
            "duration_days": int(plan.duration_days),
            "missing_skills": plan.missing_skills or [],
            "plan": plan.plan or [],
            "raw_plan_text": plan.raw_plan_text,
        }
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Error in get_latest_plan_endpoint: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Internal Error: {str(e)}"}
        )


@router.post(
    "/customize-resume",
    response_model=CustomizeResumeResponse,
    summary="ATS-optimise a resume for a specific job description",
)
async def customize_resume_endpoint(
    payload: CustomizeResumeRequest,
    current_user: User = Depends(get_current_user),
) -> CustomizeResumeResponse:
    """
    Compare the user's resume with a job description and generate an
    ATS-optimised version with added keywords and improvements.

    Provide either `resume_id` (stored resume) or `resume_text` (raw text).
    """
    resume_text = payload.resume_text

    if not resume_text:
        if payload.resume_id:
            resume = await get_resume_by_id(payload.resume_id, str(current_user.id))
            resume_text = resume.raw_text
        else:
            # Fall back to the user's active resume
            resume = await get_user_active_resume(str(current_user.id))
            if not resume:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No resume found. Upload a resume first.",
                )
            resume_text = resume.raw_text

    if not resume_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Resume text could not be retrieved.",
        )

    result = await customize_resume(
        job_description=payload.job_description,
        resume_text=resume_text,
    )
    return CustomizeResumeResponse(**result)


@router.post(
    "/generate-email",
    response_model=GenerateEmailResponse,
    summary="Generate a professional job application email",
)
async def generate_email_endpoint(
    payload: GenerateEmailRequest,
    current_user: User = Depends(get_current_user),
) -> GenerateEmailResponse:
    """
    Generate a professional email for:
    - **application**: First-time job application
    - **follow_up**: Following up on a submitted application
    - **hr_outreach**: Cold outreach to a recruiter / HR contact
    """
    valid_types = {"application", "follow_up", "hr_outreach"}
    if payload.email_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"email_type must be one of: {', '.join(valid_types)}",
        )

    result = await generate_email(
        email_type=payload.email_type,
        job_title=payload.job_title,
        company_name=payload.company_name,
        job_description=payload.job_description,
        candidate_name=payload.candidate_name or current_user.full_name,
        extra_context=payload.extra_context,
    )
    return GenerateEmailResponse(
        subject=result.get("subject", ""),
        body=result.get("body", ""),
        email_type=payload.email_type,
    )


@router.post(
    "/study-plan",
    response_model=StudyPlanResponse,
    summary="Generate a personalised learning roadmap",
)
async def study_plan_endpoint(
    payload: StudyPlanRequest,
    current_user: User = Depends(get_current_user),
) -> StudyPlanResponse:
    """
    Create a day-by-day study roadmap to reach a target role.

    If `current_skills` is omitted, uses skills from the user's profile.
    Duration defaults to 30 days (range: 7–90).
    """
    return await create_study_plan(str(current_user.id), payload)
