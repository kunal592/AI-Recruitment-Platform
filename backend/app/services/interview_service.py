"""
app/services/interview_service.py
─────────────────────────────────────────────────────────────────────────────
Creates mock interview sessions, stores questions, and evaluates user answers.
"""

from datetime import datetime
from typing import List

from fastapi import HTTPException, status

from app.ai.gemini_service import evaluate_answer, generate_mock_questions
from app.models.interview import InterviewSession
from app.schemas.ai import (
    EvaluateAnswerRequest,
    EvaluateAnswerResponse,
    InterviewQuestionsRequest,
    InterviewQuestionsResponse,
)


async def create_interview_session(
    user_id: str,
    payload: InterviewQuestionsRequest,
) -> InterviewQuestionsResponse:
    """
    Generate interview questions and persist a new session.

    Returns the session ID and list of questions.
    """
    questions: List[str] = await generate_mock_questions(
        job_title=payload.job_title,
        interview_type=payload.interview_type,
        job_description=payload.job_description,
        num_questions=payload.num_questions,
    )

    qa_pairs = [{"question": q, "answer": None, "evaluation": None, "score": None}
                for q in questions]

    session = InterviewSession(
        user_id=user_id,
        job_title=payload.job_title,
        job_description=payload.job_description,
        interview_type=payload.interview_type,
        qa_pairs=qa_pairs,
    )
    await session.insert()

    return InterviewQuestionsResponse(
        session_id=str(session.id),
        questions=questions,
        interview_type=payload.interview_type,
    )


async def evaluate_interview_answer(
    user_id: str,
    payload: EvaluateAnswerRequest,
) -> EvaluateAnswerResponse:
    """
    Evaluate a single answer within an existing session.
    Updates the QA pair in MongoDB.
    """
    session = await InterviewSession.get(payload.session_id)
    if not session or session.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found.",
        )

    idx = payload.question_index
    if idx < 0 or idx >= len(session.qa_pairs):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid question index {idx}. Session has {len(session.qa_pairs)} questions.",
        )

    question = session.qa_pairs[idx]["question"]
    result = await evaluate_answer(
        question=question,
        answer=payload.answer,
        job_title=session.job_title or "Software Engineer",
    )

    # Persist the answer + evaluation
    session.qa_pairs[idx]["answer"] = payload.answer
    session.qa_pairs[idx]["evaluation"] = result.get("evaluation")
    session.qa_pairs[idx]["score"] = result.get("score")
    session.updated_at = datetime.utcnow()

    # If all answered, mark completed and compute average
    answered = [p for p in session.qa_pairs if p.get("answer") is not None]
    if len(answered) == len(session.qa_pairs):
        scores = [p["score"] for p in session.qa_pairs if p.get("score") is not None]
        session.total_score = sum(scores) / len(scores) if scores else None
        session.completed = True

    await session.save()

    return EvaluateAnswerResponse(
        evaluation=result.get("evaluation", ""),
        score=result.get("score", 0),
        feedback=result.get("feedback", ""),
        model_answer=result.get("model_answer"),
    )
