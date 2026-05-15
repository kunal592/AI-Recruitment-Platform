"""
app/routes/automation.py
─────────────────────────────────────────────────────────────────────────────
Playwright-powered job application automation endpoint.
"""

from fastapi import APIRouter, Depends, Query

from app.automation.auto_apply import run_auto_apply
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.ai import AutoApplyRequest, AutoApplyResponse

router = APIRouter(prefix="/automation", tags=["Automation"])


@router.post(
    "/auto-apply",
    response_model=AutoApplyResponse,
    summary="Auto-fill a job application form using Playwright",
)
async def auto_apply(
    payload: AutoApplyRequest,
    submit: bool = Query(
        default=False,
        description="Set to true to actually click Submit. Default: false (safe preview mode).",
    ),
    current_user: User = Depends(get_current_user),
) -> AutoApplyResponse:
    """
    Launches a Chromium browser, navigates to the job application URL,
    auto-fills form fields with the user's profile data, attaches their
    resume, and takes a screenshot.

    **submit=false (default — safe mode)**:
    Form is filled but NOT submitted. Use the screenshot to review.

    **submit=true**:
    Clicks the submit button. Use with caution.

    ### Input
    - **job_url**: Direct URL to the job application form
    - **resume_id**: ID of an uploaded resume to attach (optional)
    - **cover_letter**: Pre-written cover letter text (optional)
    - **extra_fields**: Dict of `{css_selector: value}` for site-specific fields
    """
    return await run_auto_apply(
        user_id=str(current_user.id),
        payload=payload,
        submit=submit,
    )
