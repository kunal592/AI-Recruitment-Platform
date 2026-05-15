"""
app/routes/resume.py
─────────────────────────────────────────────────────────────────────────────
Resume upload, AI parsing, and retrieval endpoints.
"""

from fastapi import APIRouter, Depends, File, UploadFile, status

from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.resume import ResumeResponse
from app.services.resume_service import get_resume_by_id, upload_and_parse_resume

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post(
    "/upload",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and AI-parse a resume (PDF or DOCX)",
)
async def upload_resume(
    file: UploadFile = File(..., description="PDF or DOCX resume file"),
    current_user: User = Depends(get_current_user),
) -> ResumeResponse:
    """
    Upload a resume file. The backend will:
    1. Save it to disk
    2. Extract raw text
    3. Use Gemini AI to parse structured data
    4. Store all data in MongoDB

    Returns the full parsed resume object.
    """
    resume = await upload_and_parse_resume(
        user_id=str(current_user.id),
        file=file,
    )
    return ResumeResponse(
        id=str(resume.id),
        user_id=resume.user_id,
        original_filename=resume.original_filename,
        file_type=resume.file_type,
        file_size_bytes=resume.file_size_bytes,
        is_parsed=resume.is_parsed,
        parsed_name=resume.parsed_name,
        parsed_email=resume.parsed_email,
        parsed_phone=resume.parsed_phone,
        parsed_skills=resume.parsed_skills,
        parsed_education=resume.parsed_education,
        parsed_experience=resume.parsed_experience,
        parsed_projects=resume.parsed_projects,
        parsed_certifications=resume.parsed_certifications,
        parsed_summary=resume.parsed_summary,
        raw_text=resume.raw_text,
    )


@router.get(
    "/{resume_id}",
    response_model=ResumeResponse,
    summary="Retrieve a specific resume by ID",
)
async def get_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
) -> ResumeResponse:
    """Fetch full details of a previously uploaded resume."""
    resume = await get_resume_by_id(resume_id, str(current_user.id))
    return ResumeResponse(
        id=str(resume.id),
        user_id=resume.user_id,
        original_filename=resume.original_filename,
        file_type=resume.file_type,
        file_size_bytes=resume.file_size_bytes,
        is_parsed=resume.is_parsed,
        parsed_name=resume.parsed_name,
        parsed_email=resume.parsed_email,
        parsed_phone=resume.parsed_phone,
        parsed_skills=resume.parsed_skills,
        parsed_education=resume.parsed_education,
        parsed_experience=resume.parsed_experience,
        parsed_projects=resume.parsed_projects,
        parsed_certifications=resume.parsed_certifications,
        parsed_summary=resume.parsed_summary,
    )
