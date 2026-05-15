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
    Handles markdown code fences and potential truncation.
    """
    # 1. Try to find content between triple backticks if present
    match = re.search(r"```(?:json)?\s*([\s\S]*?)(?:```|$)", text)
    if match:
        cleaned = match.group(1).strip()
    else:
        cleaned = text.strip()

    # 2. Try standard parsing
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # 3. If it failed, it might be truncated. Try to close unclosed brackets.
        try:
            return _fix_truncated_json(cleaned)
        except Exception as e:
            logger.warning("JSON decode error: {} | raw: {}", e, cleaned[:300])
            raise ValueError(f"AI returned invalid or truncated JSON: {cleaned[:200]}...") from e

def _fix_truncated_json(json_str: str) -> Dict[str, Any]:
    """Attempts to fix truncated JSON by closing open braces/brackets/quotes."""
    stack = []
    in_string = False
    escaped = False
    fixed = json_str
    
    for char in json_str:
        if char == '"' and not escaped:
            in_string = not in_string
        elif not in_string:
            if char == '{': stack.append('}')
            elif char == '[': stack.append(']')
            elif char == '}' or char == ']':
                if stack and stack[-1] == char:
                    stack.pop()
        
        if char == '\\':
            escaped = not escaped
        else:
            escaped = False
            
    # If we are inside a string, close it
    if in_string:
        fixed += '"'
    
    # Close any remaining open braces/brackets
    while stack:
        fixed += stack.pop()
    
    return json.loads(fixed)


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
