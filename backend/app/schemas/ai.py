"""
app/schemas/ai.py
─────────────────────────────────────────────────────────────────────────────
Pydantic schemas for all AI-powered endpoints.
"""

from typing import List, Optional

from pydantic import BaseModel, Field


# ── Resume Customizer ─────────────────────────────────────────────────────────

class CustomizeResumeRequest(BaseModel):
    job_description: str = Field(..., min_length=50)
    resume_id: Optional[str] = None   # Use stored resume if provided
    resume_text: Optional[str] = None  # Or pass raw text directly

    model_config = {"json_schema_extra": {"example": {
        "job_description": "We are looking for a senior Python backend engineer …",
        "resume_id": "665abc123…",
    }}}


class CustomizeResumeResponse(BaseModel):
    optimized_resume_text: str
    ats_score: Optional[int] = None        # Estimated ATS compatibility 0-100
    added_keywords: List[str] = []
    removed_weaknesses: List[str] = []
    suggestions: List[str] = []


# ── Email Generator ───────────────────────────────────────────────────────────

class GenerateEmailRequest(BaseModel):
    email_type: str = Field(
        ...,
        description="One of: application | follow_up | hr_outreach",
        examples=["application"],
    )
    job_title: str
    company_name: str
    job_description: Optional[str] = None
    candidate_name: Optional[str] = None
    extra_context: Optional[str] = None


class GenerateEmailResponse(BaseModel):
    subject: str
    body: str
    email_type: str


# ── Study Plan ────────────────────────────────────────────────────────────────

class StudyPlanRequest(BaseModel):
    target_role: str = Field(..., examples=["Full Stack Developer"])
    current_skills: List[str] = Field(default_factory=list)
    duration_days: int = Field(default=30, ge=7, le=90)


class StudyPlanResponse(BaseModel):
    target_role: str
    duration_days: int
    missing_skills: List[str]
    plan: List[dict]   # List of daily / weekly tasks
    raw_plan_text: Optional[str] = None


# ── Interview ─────────────────────────────────────────────────────────────────

class InterviewQuestionsRequest(BaseModel):
    job_title: str = Field(..., examples=["Backend Engineer"])
    job_description: Optional[str] = None
    interview_type: str = Field(default="mixed", examples=["technical", "hr", "mixed"])
    num_questions: int = Field(default=10, ge=3, le=20)


class InterviewQuestionsResponse(BaseModel):
    session_id: str
    questions: List[str]
    interview_type: str


class EvaluateAnswerRequest(BaseModel):
    session_id: str
    question_index: int
    answer: str


class EvaluateAnswerResponse(BaseModel):
    evaluation: str
    score: int          # 0-10
    feedback: str
    model_answer: Optional[str] = None


# ── Automation ────────────────────────────────────────────────────────────────

class AutoApplyRequest(BaseModel):
    job_url: str = Field(..., examples=["https://example.com/jobs/123"])
    resume_id: Optional[str] = None
    cover_letter: Optional[str] = None
    extra_fields: Optional[dict] = None   # Any site-specific form fields


class AutoApplyResponse(BaseModel):
    success: bool
    message: str
    screenshot_path: Optional[str] = None
    applied_at: Optional[str] = None


# ── Reminder ─────────────────────────────────────────────────────────────────

class ReminderRequest(BaseModel):
    title: str = Field(..., examples=["Interview with Acme Corp"])
    message: str
    reminder_type: str = Field(default="interview", examples=["interview", "follow_up"])
    scheduled_at: str = Field(..., examples=["2025-08-15T10:00:00"])  # ISO 8601


class ReminderResponse(BaseModel):
    id: str
    title: str
    message: str
    reminder_type: str
    scheduled_at: str
    is_sent: bool
