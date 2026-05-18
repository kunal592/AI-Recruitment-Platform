"""
app/automation/auto_apply.py
─────────────────────────────────────────────────────────────────────────────
Orchestrates the end-to-end automated job application flow:
  1. Open the job URL in a Playwright Chromium page
  2. Detect and navigate to the application form
  3. Fill out fields with user data
  4. Attach the resume file
  5. Take a confirmation screenshot
  6. (Optional) Submit the form — requires explicit opt-in via submit=True
"""

import asyncio
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

from loguru import logger
from playwright.async_api import Page, TimeoutError as PlaywrightTimeout

from app.automation.browser import BrowserManager
from app.automation.form_filler import smart_fill_application_form
from app.config.settings import settings
from app.models.resume import Resume
from app.schemas.ai import AutoApplyRequest, AutoApplyResponse


# Screenshot directory
SCREENSHOT_DIR = Path(settings.upload_dir) / "screenshots"
SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)


async def _navigate_to_apply_page(page: Page, job_url: str) -> None:
    """Navigate to the job URL and attempt to click an 'Apply' button."""
    await page.goto(job_url, wait_until="domcontentloaded", timeout=30_000)
    await asyncio.sleep(2)  # Let dynamic content load

    # Common apply-button selectors across job boards
    apply_selectors = [
        "a:text-is('Apply')",
        "a:text-matches('Apply Now', 'i')",
        "button:text-matches('Apply', 'i')",
        "a[href*='apply']",
        "[data-testid*='apply']",
        ".apply-button",
        "#apply-button",
    ]

    for selector in apply_selectors:
        try:
            btn = page.locator(selector).first
            if await btn.count() > 0:
                await btn.click()
                await asyncio.sleep(2)
                logger.debug("Clicked apply button via selector: {}", selector)
                return
        except Exception:
            continue

    logger.info("No apply button found — assuming current page IS the form.")


async def run_auto_apply(
    user_id: str,
    payload: AutoApplyRequest,
    submit: bool = False,  # Safety: never auto-submit unless explicitly True
) -> AutoApplyResponse:
    """
    Main entry point for automated job application.

    Args:
        user_id:  Authenticated user's ID.
        payload:  AutoApplyRequest with job_url, optional resume_id, etc.
        submit:   If True, actually clicks the submit button. Default False (safe mode).

    Returns:
        AutoApplyResponse with success flag, message, and screenshot path.
    """
    screenshot_path: Optional[str] = None

    # Resolve resume file path
    resume_path: Optional[str] = None
    if payload.resume_id:
        resume_doc = await Resume.get(payload.resume_id)
        if resume_doc and resume_doc.user_id == user_id:
            resume_path = resume_doc.file_path

    # Build user data dict from profile
    from app.models.profile import Profile
    from app.models.user import User

    user = await User.get(user_id)
    profile = await Profile.find_one(Profile.user_id == user_id)

    user_data = {
        "full_name": user.full_name if user else "",
        "email": user.email if user else "",
        "phone": profile.phone if profile else "",
        "linkedin_url": profile.linkedin_url if profile else "",
    }

    try:
        async with BrowserManager.page_session() as page:
            # Step 1: Navigate
            logger.info("Auto-apply: opening {}", payload.job_url)
            await _navigate_to_apply_page(page, payload.job_url)

            # Step 2: Fill form
            await smart_fill_application_form(
                page=page,
                user_data=user_data,
                resume_path=resume_path,
                extra_fields=payload.extra_fields,
            )

            # Step 3: Fill cover letter if provided
            if payload.cover_letter:
                cover_selectors = [
                    "textarea[name*='cover' i]",
                    "textarea[placeholder*='cover' i]",
                    "textarea[aria-label*='cover' i]",
                    "textarea#coverLetter",
                ]
                for sel in cover_selectors:
                    from app.automation.form_filler import fill_text_field
                    if await fill_text_field(page, sel, payload.cover_letter, delay=10):
                        break

            # Step 4: Screenshot (before submit)
            ss_filename = f"{user_id}_{uuid.uuid4().hex[:8]}.png"
            ss_path = SCREENSHOT_DIR / ss_filename
            await page.screenshot(path=str(ss_path), full_page=True)
            screenshot_path = str(ss_path)
            logger.info("Screenshot saved: {}", ss_path)

            # Step 5: Submit (only if explicitly enabled)
            if submit:
                submit_selectors = [
                    "button[type='submit']",
                    "input[type='submit']",
                    "button:text-matches('Submit', 'i')",
                    "button:text-matches('Send Application', 'i')",
                ]
                for sel in submit_selectors:
                    btn = page.locator(sel).first
                    if await btn.count() > 0:
                        await btn.click()
                        await asyncio.sleep(3)
                        logger.success("Application submitted for user {}", user_id)
                        break

        # Step 6: Save application state to database
        try:
            from app.models.job import Job, SavedJob
            from bson import ObjectId
            
            job = None
            if payload.job_id:
                # Try Mongo ID first
                if len(payload.job_id) == 24:
                    try:
                        job = await Job.get(ObjectId(payload.job_id))
                    except Exception:
                        pass
                # Try external_id
                if not job:
                    job = await Job.find_one(Job.external_id == payload.job_id)
            
            # Try finding by URL if not found by ID
            if not job:
                job = await Job.find_one(Job.apply_url == payload.job_url)
                
            # If found, check if SavedJob exists, otherwise create it
            if job:
                existing = await SavedJob.find_one(
                    SavedJob.user_id == user_id,
                    SavedJob.job_id == job.external_id,
                )
                if existing:
                    existing.applied = True
                    existing.status = "applied"
                    existing.applied_at = datetime.utcnow()
                    await existing.save()
                    logger.info("Updated existing SavedJob application tracking for user_id={}", user_id)
                else:
                    saved = SavedJob(
                        user_id=user_id,
                        job_id=job.external_id,
                        job_data=job.model_dump() if hasattr(job, "model_dump") else job.dict(),
                        applied=True,
                        applied_at=datetime.utcnow(),
                        status="applied",
                        is_manual=False
                    )
                    await saved.insert()
                    logger.info("Created new SavedJob application tracking for user_id={}", user_id)
            else:
                # Fallback: create a manual/tracked application entry from URL domain
                from urllib.parse import urlparse
                domain = urlparse(payload.job_url).netloc or "External Site"
                company = domain.replace("www.", "").split(".")[0].capitalize()
                
                fallback_job_data = {
                    "title": "Online Application",
                    "company": company,
                    "location": "Remote",
                    "description": f"Applied via Auto-Apply at {payload.job_url}",
                    "external_id": f"auto_{uuid.uuid4().hex[:8]}",
                    "source": "auto_apply",
                    "apply_url": payload.job_url,
                }
                
                saved = SavedJob(
                    user_id=user_id,
                    job_id=fallback_job_data["external_id"],
                    job_data=fallback_job_data,
                    applied=True,
                    applied_at=datetime.utcnow(),
                    status="applied",
                    is_manual=False
                )
                await saved.insert()
                logger.info("Created fallback SavedJob application tracking from domain={} for user_id={}", company, user_id)
        except Exception as db_exc:
            logger.error("Failed to update SavedJob application state: {}", db_exc)

        return AutoApplyResponse(
            success=True,
            message="Form filled successfully." + (" Application submitted." if submit else " Review the screenshot before submitting."),
            screenshot_path=screenshot_path,
            applied_at=datetime.utcnow().isoformat(),
        )

    except PlaywrightTimeout as exc:
        logger.error("Playwright timeout on {}: {}", payload.job_url, exc)
        return AutoApplyResponse(
            success=False,
            message=f"Page load timed out: {exc}",
            screenshot_path=screenshot_path,
        )
    except Exception as exc:
        logger.error("Auto-apply failed: {}", exc)
        return AutoApplyResponse(
            success=False,
            message=f"Automation error: {exc}",
            screenshot_path=screenshot_path,
        )
