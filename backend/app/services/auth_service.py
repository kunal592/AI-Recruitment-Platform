"""
app/services/auth_service.py
─────────────────────────────────────────────────────────────────────────────
Business logic for user registration and login.
Keeps route handlers thin and testable.
"""

from datetime import datetime

from fastapi import HTTPException, status
from loguru import logger

from app.core.security import create_access_token, hash_password, verify_password
from app.models.profile import Profile
from app.models.user import User
from app.schemas.auth import RegisterRequest, TokenResponse


async def register_user(payload: RegisterRequest) -> TokenResponse:
    """
    Create a new user account.

    Steps:
    1. Check if email already exists.
    2. Hash the password.
    3. Insert User document.
    4. Create an empty Profile document.
    5. Return a JWT token.
    """
    # Normalize email
    payload.email = payload.email.lower()
    
    existing = await User.find_one(User.email == payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    await user.insert()

    # Auto-create empty profile
    profile = Profile(user_id=str(user.id))
    await profile.insert()

    token = create_access_token(data={"sub": str(user.id)})
    logger.info("New user registered: {} ({})", user.full_name, user.email)

    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        full_name=user.full_name,
        email=user.email,
    )


async def login_user(email: str, password: str) -> TokenResponse:
    """
    Authenticate an existing user and return a JWT.

    Raises:
        401 if email not found or password is incorrect.
        403 if account is deactivated.
    """
    # Normalize email for case-insensitive lookup
    email = email.lower()
    
    user = await User.find_one(User.email == email)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated.",
        )

    # Update last-login timestamp
    user.updated_at = datetime.utcnow()
    await user.save()

    token = create_access_token(data={"sub": str(user.id)})
    logger.info("User logged in: {}", user.email)

    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        full_name=user.full_name,
        email=user.email,
    )


from beanie import PydanticObjectId

async def update_password(user_id: str, current_password: str, new_password: str) -> None:
    """Verify current password and set a new one."""
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if not verify_password(current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect.",
        )

    user.hashed_password = hash_password(new_password)
    user.updated_at = datetime.utcnow()
    await user.save()
    logger.info("Password updated for user: {}", user.email)
