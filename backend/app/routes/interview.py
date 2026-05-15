"""
app/routes/interview.py
─────────────────────────────────────────────────────────────────────────────
Mock interview chatbot endpoints.
"""

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.ai import (
    EvaluateAnswerRequest,
    EvaluateAnswerResponse,
    InterviewQuestionsRequest,
    InterviewQuestionsResponse,
)
from app.services.interview_service import (
    create_interview_session,
    evaluate_interview_answer,
)

router = APIRouter(prefix="/interview", tags=["Mock Interview"])


@router.post(
    "/questions",
    response_model=InterviewQuestionsResponse,
    summary="Generate interview questions and start a session",
)
async def generate_questions(
    payload: InterviewQuestionsRequest,
    current_user: User = Depends(get_current_user),
) -> InterviewQuestionsResponse:
    """
    Generate a set of mock interview questions using Gemini AI.

    - **interview_type**: `technical` | `hr` | `mixed`
    - **num_questions**: 3–20 (default 10)
    - Returns a `session_id` used to submit answers.
    """
    return await create_interview_session(str(current_user.id), payload)


@router.post(
    "/evaluate",
    response_model=EvaluateAnswerResponse,
    summary="Evaluate a single interview answer",
)
async def evaluate_answer(
    payload: EvaluateAnswerRequest,
    current_user: User = Depends(get_current_user),
) -> EvaluateAnswerResponse:
    """
    Submit an answer for a specific question in an existing session.

    - **session_id**: Returned from `/interview/questions`
    - **question_index**: 0-based index of the question being answered
    - **answer**: The candidate's answer text

    Returns a score (0-10), evaluation label, detailed feedback,
    and an ideal model answer.
    """
    return await evaluate_interview_answer(str(current_user.id), payload)
