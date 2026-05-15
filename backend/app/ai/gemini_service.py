"""
app/ai/gemini_service.py
─────────────────────────────────────────────────────────────────────────────
High-level AI service functions that assemble prompts, call Gemini,
and return typed Python dicts ready for use in route handlers.
"""

import json
import re
from typing import Any, Dict, List, Optional

from loguru import logger

from app.ai.gemini_client import get_gemini_client
from app.ai.prompts import (
    EMAIL_GENERATION_PROMPT,
    EVALUATE_ANSWER_PROMPT,
    INTERVIEW_QUESTIONS_PROMPT,
    RESUME_CUSTOMIZE_PROMPT,
    RESUME_PARSE_PROMPT,
    STUDY_PLAN_PROMPT,
)


def _parse_json_response(text: str) -> Dict[str, Any]:
    """
    Safely extract JSON from a Gemini response.
    Handles markdown code fences Gemini sometimes adds despite instructions.
    """
    # Strip ```json ... ``` or ``` ... ``` blocks
    cleaned = re.sub(r"```(?:json)?\s*", "", text).replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        logger.warning("JSON decode error: {} | raw: {}", exc, cleaned[:300])
        raise ValueError(f"AI returned non-JSON response: {cleaned[:200]}") from exc


# ─── Resume Parsing ───────────────────────────────────────────────────────────

async def parse_resume(resume_text: str) -> Dict[str, Any]:
    """
    Use Gemini to extract structured fields from raw resume text.

    Returns:
        Dict with keys: name, email, phone, summary, skills,
        experience, education, projects, certifications.
    """
    client = get_gemini_client()
    prompt = RESUME_PARSE_PROMPT.format(resume_text=resume_text)
    raw = await client.generate_json(prompt)
    return _parse_json_response(raw)


# ─── Resume Customiser ────────────────────────────────────────────────────────

async def customize_resume(
    job_description: str,
    resume_text: str,
) -> Dict[str, Any]:
    """
    Rewrite and ATS-optimise a resume for a specific job description.

    Returns:
        Dict with keys: optimized_resume_text, ats_score, added_keywords,
        removed_weaknesses, suggestions.
    """
    client = get_gemini_client()
    prompt = RESUME_CUSTOMIZE_PROMPT.format(
        job_description=job_description,
        resume_text=resume_text,
    )
    raw = await client.generate_json(prompt)
    return _parse_json_response(raw)


# ─── Email Generator ──────────────────────────────────────────────────────────

async def generate_email(
    email_type: str,
    job_title: str,
    company_name: str,
    job_description: Optional[str] = None,
    candidate_name: Optional[str] = "Candidate",
    extra_context: Optional[str] = "",
) -> Dict[str, str]:
    """
    Generate a professional email (application / follow-up / HR outreach).

    Returns:
        Dict with keys: subject, body.
    """
    client = get_gemini_client()
    prompt = EMAIL_GENERATION_PROMPT.format(
        email_type=email_type,
        job_title=job_title,
        company_name=company_name,
        candidate_name=candidate_name or "Candidate",
        job_description=job_description or "Not provided",
        extra_context=extra_context or "",
    )
    raw = await client.generate_json(prompt)
    return _parse_json_response(raw)


# ─── Study Plan ───────────────────────────────────────────────────────────────

async def generate_study_plan(
    target_role: str,
    current_skills: List[str],
    duration_days: int = 30,
) -> Dict[str, Any]:
    """
    Generate a week-by-week study roadmap to reach the target role.

    Returns:
        Dict with keys: missing_skills, plan (list of week dicts), raw_plan_text.
    """
    client = get_gemini_client()
    skills_str = ", ".join(current_skills) if current_skills else "none listed"
    prompt = STUDY_PLAN_PROMPT.format(
        target_role=target_role,
        current_skills=skills_str,
        duration_days=duration_days,
    )
    raw = await client.generate_json(prompt, temperature=0.5)
    return _parse_json_response(raw)


# ─── Mock Interview ───────────────────────────────────────────────────────────

async def generate_mock_questions(
    job_title: str,
    interview_type: str = "mixed",
    job_description: Optional[str] = None,
    num_questions: int = 10,
) -> List[str]:
    """
    Generate a list of interview questions.

    Returns:
        List of question strings.
    """
    client = get_gemini_client()
    jd_section = (
        f"Job Description:\n\"\"\"{job_description}\"\"\""
        if job_description
        else ""
    )
    prompt = INTERVIEW_QUESTIONS_PROMPT.format(
        job_title=job_title,
        interview_type=interview_type,
        num_questions=num_questions,
        job_description_section=jd_section,
    )
    raw = await client.generate_json(prompt)
    data = _parse_json_response(raw)
    return data.get("questions", [])


async def evaluate_answer(
    question: str,
    answer: str,
    job_title: str,
) -> Dict[str, Any]:
    """
    Evaluate a candidate's answer to an interview question.

    Returns:
        Dict with keys: evaluation, score, feedback, model_answer.
    """
    client = get_gemini_client()
    prompt = EVALUATE_ANSWER_PROMPT.format(
        question=question,
        answer=answer,
        job_title=job_title,
    )
    raw = await client.generate_json(prompt)
    return _parse_json_response(raw)
