"""
app/routes/profile.py
─────────────────────────────────────────────────────────────────────────────
User profile CRUD endpoints.
"""

from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.profile import ProfileResponse, ProfileUpdateRequest, SkillsUpdateRequest
from app.services.profile_service import add_skills, get_or_create_profile, update_profile

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get(
    "",
    response_model=ProfileResponse,
    summary="Get the authenticated user's profile",
)
async def get_profile(current_user: User = Depends(get_current_user)) -> ProfileResponse:
    """Return the full profile for the authenticated user."""
    profile = await get_or_create_profile(str(current_user.id))
    return ProfileResponse(**profile.model_dump(exclude={"id", "revision_id"}))


@router.put(
    "",
    response_model=ProfileResponse,
    summary="Update profile fields (partial update supported)",
)
async def update_user_profile(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
) -> ProfileResponse:
    """
    Update any profile fields. All fields are optional — only provided
    fields are changed. Pass an empty list to clear a list field.
    """
    profile = await update_profile(str(current_user.id), payload)
    return ProfileResponse(**profile.model_dump(exclude={"id", "revision_id"}))


@router.post(
    "/skills",
    response_model=ProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Replace the user's skills list",
)
async def update_skills(
    payload: SkillsUpdateRequest,
    current_user: User = Depends(get_current_user),
) -> ProfileResponse:
    """Replace the entire skills list for the authenticated user."""
    profile = await add_skills(str(current_user.id), payload.skills)
    return ProfileResponse(**profile.model_dump(exclude={"id", "revision_id"}))


@router.post(
    "/sync-resume",
    response_model=ProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Sync parsed resume data to profile",
)
async def sync_resume_to_profile(
    parsed_data: dict,
    current_user: User = Depends(get_current_user),
) -> ProfileResponse:
    """
    Apply parsed resume data to the user's profile and core identity.
    This is called when a user confirms the accuracy of the extraction.
    """
    from app.services.profile_service import sync_profile_from_resume
    profile = await sync_profile_from_resume(str(current_user.id), parsed_data)
    return ProfileResponse(**profile.model_dump(exclude={"id", "revision_id"}))


from app.schemas.settings import AIPreferences
from app.services.profile_service import update_ai_preferences

@router.put(
    "/ai-preferences",
    response_model=ProfileResponse,
    summary="Update AI automation preferences",
)
async def update_ai_prefs(
    payload: AIPreferences,
    current_user: User = Depends(get_current_user),
) -> ProfileResponse:
    """Update user's AI automation settings."""
    profile = await update_ai_preferences(str(current_user.id), payload)
    return ProfileResponse(**profile.model_dump(exclude={"id", "revision_id"}))
