"""
app/services/resume_service.py
─────────────────────────────────────────────────────────────────────────────
Handles resume file upload, text extraction, Gemini AI parsing,
and storing the structured result in MongoDB.
"""

import os
import uuid
from datetime import datetime
from pathlib import Path

import aiofiles
from fastapi import HTTPException, UploadFile, status
from loguru import logger

from app.ai.gemini_service import parse_resume as ai_parse_resume
from app.config.settings import settings
from app.models.resume import Resume
from app.resume_parser.extractor import extract_resume_text

# Allowed MIME types
ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}
ALLOWED_EXTENSIONS = {"pdf", "docx"}


async def upload_and_parse_resume(
    user_id: str,
    file: UploadFile,
) -> Resume:
    """
    End-to-end resume processing pipeline:
    1. Validate file type and size.
    2. Save to disk.
    3. Extract raw text.
    4. AI-parse structured data via Gemini.
    5. Persist Resume document in MongoDB.

    Returns the saved Resume document.
    """
    # ── 1. Validate file type ────────────────────────────────────────────────
    filename = file.filename or "resume"
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Only PDF and DOCX files are accepted. Got: .{ext}",
        )

    # ── 2. Read and validate file size ───────────────────────────────────────
    file_bytes = await file.read()
    if len(file_bytes) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum size of {settings.max_file_size_mb} MB.",
        )

    # ── 3. Save to disk ──────────────────────────────────────────────────────
    upload_dir = Path(settings.upload_dir) / user_id
    upload_dir.mkdir(parents=True, exist_ok=True)

    unique_name = f"{uuid.uuid4().hex}_{filename}"
    file_path = upload_dir / unique_name

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(file_bytes)

    logger.info("Resume saved to {}", file_path)

    # ── 4. Extract raw text ──────────────────────────────────────────────────
    try:
        raw_text = extract_resume_text(file_bytes, ext)
        logger.debug("Extracted text (first 200 chars): {}", raw_text[:200])
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))

    # ── 5. Gemini AI parsing ─────────────────────────────────────────────────
    parsed_data: dict = {}
    is_parsed = False
    try:
        parsed_data = await ai_parse_resume(raw_text)
        is_parsed = True
        logger.success("Resume parsed by Gemini for user {}", user_id)
    except Exception as exc:
        logger.error("Gemini parse failed — storing raw text only. Error: {}", exc)

    # ── 6. Persist to MongoDB ────────────────────────────────────────────────
    # Mark all previous resumes inactive
    await Resume.find(Resume.user_id == user_id).update({"$set": {"is_active": False}})

    resume = Resume(
        user_id=user_id,
        original_filename=filename,
        file_path=str(file_path),
        file_type=ext,
        file_size_bytes=len(file_bytes),
        raw_text=raw_text,
        is_parsed=is_parsed,
        parsed_name=parsed_data.get("name"),
        parsed_email=parsed_data.get("email"),
        parsed_phone=parsed_data.get("phone"),
        parsed_skills=parsed_data.get("skills", []),
        parsed_education=parsed_data.get("education", []),
        parsed_experience=parsed_data.get("experience", []),
        parsed_projects=parsed_data.get("projects", []),
        parsed_certifications=parsed_data.get("certifications", []),
        parsed_summary=parsed_data.get("summary"),
        updated_at=datetime.utcnow(),
    )
    await resume.insert()
    return resume


async def get_resume_by_id(resume_id: str, user_id: str) -> Resume:
    """Fetch a single resume by ID, scoped to the requesting user."""
    resume = await Resume.get(resume_id)
    if not resume or resume.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )
    return resume


async def get_user_active_resume(user_id: str) -> Resume | None:
    """Return the user's currently active resume (most recently uploaded)."""
    return await Resume.find_one(
        Resume.user_id == user_id,
        Resume.is_active == True,
    )
