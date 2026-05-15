"""
app/automation/form_filler.py
─────────────────────────────────────────────────────────────────────────────
Reusable Playwright helpers for form detection and filling.
Designed to be called from the auto-apply orchestrator.
"""

import asyncio
from pathlib import Path
from typing import Optional

from loguru import logger
from playwright.async_api import Page


async def fill_text_field(page: Page, selector: str, value: str, delay: int = 60) -> bool:
    """
    Fill a text / email / tel input field if it exists.

    Args:
        selector: CSS selector or label text.
        value:    Value to type.
        delay:    Typing delay in ms (simulates human speed).

    Returns:
        True if field was found and filled.
    """
    try:
        locator = page.locator(selector).first
        if await locator.count() > 0:
            await locator.click()
            await locator.fill("")          # Clear first
            await locator.type(value, delay=delay)
            logger.debug("Filled field '{}' with '{}'", selector, value[:30])
            return True
    except Exception as exc:
        logger.warning("Could not fill '{}': {}", selector, exc)
    return False


async def upload_file_field(page: Page, selector: str, file_path: str) -> bool:
    """
    Attach a file to an <input type="file"> element.
    """
    try:
        locator = page.locator(selector).first
        if await locator.count() > 0:
            await locator.set_input_files(file_path)
            logger.debug("Uploaded file '{}' to '{}'", file_path, selector)
            return True
    except Exception as exc:
        logger.warning("Could not upload to '{}': {}", selector, exc)
    return False


async def smart_fill_application_form(
    page: Page,
    user_data: dict,
    resume_path: Optional[str] = None,
    extra_fields: Optional[dict] = None,
) -> None:
    """
    Intelligently fill common job application form fields.
    Tries multiple CSS selectors / aria-labels for each field type.

    Args:
        page:        Active Playwright page with the application form loaded.
        user_data:   Dict with keys: full_name, email, phone, linkedin_url etc.
        resume_path: Absolute path to the resume file.
        extra_fields: Optional {selector: value} pairs for site-specific fields.
    """
    # ── Common field mappings: (field_label, list_of_selectors_to_try) ────────
    field_map = {
        "full_name": [
            "input[name*='name'][type!='hidden']",
            "input[placeholder*='name' i]",
            "input[aria-label*='name' i]",
            "input#name",
        ],
        "first_name": [
            "input[name*='first' i]",
            "input[placeholder*='first' i]",
            "input[aria-label*='first' i]",
        ],
        "last_name": [
            "input[name*='last' i]",
            "input[placeholder*='last' i]",
            "input[aria-label*='last' i]",
        ],
        "email": [
            "input[type='email']",
            "input[name*='email' i]",
            "input[placeholder*='email' i]",
        ],
        "phone": [
            "input[type='tel']",
            "input[name*='phone' i]",
            "input[placeholder*='phone' i]",
        ],
        "linkedin_url": [
            "input[name*='linkedin' i]",
            "input[placeholder*='linkedin' i]",
        ],
    }

    # ── Name splitting helper ────────────────────────────────────────────────
    full_name: str = user_data.get("full_name", "")
    name_parts = full_name.split(" ", 1)
    first_name = name_parts[0] if name_parts else ""
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    values = {
        "full_name": full_name,
        "first_name": first_name,
        "last_name": last_name,
        "email": user_data.get("email", ""),
        "phone": user_data.get("phone", ""),
        "linkedin_url": user_data.get("linkedin_url", ""),
    }

    for field_key, selectors in field_map.items():
        value = values.get(field_key, "")
        if not value:
            continue
        for selector in selectors:
            if await fill_text_field(page, selector, value):
                break  # Move to next field once filled
        await asyncio.sleep(0.3)  # Small pause between fields

    # ── Resume upload ────────────────────────────────────────────────────────
    if resume_path and Path(resume_path).exists():
        resume_selectors = [
            "input[type='file']",
            "input[name*='resume' i]",
            "input[name*='cv' i]",
            "input[accept*='pdf' i]",
        ]
        for sel in resume_selectors:
            if await upload_file_field(page, sel, resume_path):
                break

    # ── Extra site-specific fields ───────────────────────────────────────────
    if extra_fields:
        for selector, value in extra_fields.items():
            await fill_text_field(page, selector, str(value))
            await asyncio.sleep(0.2)

    logger.info("Form filling completed for {}", page.url)
