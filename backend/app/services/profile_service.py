"""
app/services/profile_service.py
─────────────────────────────────────────────────────────────────────────────
CRUD operations for the user Profile document.
Auto-creates a Profile if one doesn't exist (safety net).
"""

from datetime import datetime

from fastapi import HTTPException, status
from loguru import logger

from app.models.profile import Profile
from app.schemas.profile import ProfileUpdateRequest


async def get_or_create_profile(user_id: str) -> Profile:
    """Return the profile for user_id, creating an empty one if absent."""
    profile = await Profile.find_one(Profile.user_id == user_id)
    if not profile:
        profile = Profile(user_id=user_id)
        await profile.insert()
    return profile


async def update_profile(
    user_id: str,
    payload: ProfileUpdateRequest,
) -> Profile:
    """
    Partial update of the user profile.
    Only non-None fields from the request payload are applied.
    """
    profile = await get_or_create_profile(user_id)

    update_data = payload.model_dump(exclude_none=True)

    # Convert nested Pydantic models to dicts for MongoDB storage
    for list_field in ("experience", "education", "projects"):
        if list_field in update_data:
            update_data[list_field] = [
                item.model_dump() if hasattr(item, "model_dump") else item
                for item in update_data[list_field]
            ]

    update_data["updated_at"] = datetime.utcnow()

    await profile.set(update_data)
    return profile


async def add_skills(user_id: str, skills: list[str]) -> Profile:
    """Replace the skills list on the profile."""
    profile = await get_or_create_profile(user_id)
    await profile.set({"skills": skills, "updated_at": datetime.utcnow()})
    return profile


async def sync_profile_from_resume(user_id: str, parsed_data: dict) -> Profile:
    """
    Sync a user profile with structured data extracted from a resume.
    This overwrites key fields to ensure the dashboard and recommendations stay fresh.
    """
    from app.models.user import User
    
    profile = await get_or_create_profile(user_id)
    logger.debug("Syncing profile for user {} with parsed data keys: {}", user_id, list(parsed_data.keys()))
    
    update_data = {
        "updated_at": datetime.utcnow(),
    }
    
    # Update User model if name is found
    if parsed_data.get("name"):
        from beanie import PydanticObjectId
        user = await User.get(PydanticObjectId(user_id))
        if user:
            await user.set({"full_name": parsed_data["name"], "updated_at": datetime.utcnow()})
            logger.info("Updated User.full_name to '{}' for user {}", parsed_data["name"], user_id)

    if parsed_data.get("phone"):
        update_data["phone"] = parsed_data["phone"]
        
    if parsed_data.get("skills"):
        update_data["skills"] = parsed_data["skills"]
        logger.info("Synced {} skills for user {}", len(parsed_data["skills"]), user_id)
        
    if parsed_data.get("summary"):
        update_data["bio"] = parsed_data["summary"]
        
    if parsed_data.get("experience"):
        update_data["experience"] = parsed_data["experience"]
        
    if parsed_data.get("education"):
        update_data["education"] = parsed_data["education"]
        
    if parsed_data.get("projects"):
        update_data["projects"] = parsed_data["projects"]
        
    if parsed_data.get("certifications"):
        update_data["certifications"] = parsed_data["certifications"]

    await profile.set(update_data)
    logger.success("Profile fully synced from resume for user {}", user_id)
    return profile


from app.schemas.settings import AIPreferences

async def update_ai_preferences(user_id: str, payload: AIPreferences) -> Profile:
    """Update AI automation settings in user profile."""
    profile = await get_or_create_profile(user_id)
    await profile.set({
        "ai_preferences": payload.model_dump(),
        "updated_at": datetime.utcnow()
    })
    logger.info("AI preferences updated for user: {}", user_id)
    return profile
