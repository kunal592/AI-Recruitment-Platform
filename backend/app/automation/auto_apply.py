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
