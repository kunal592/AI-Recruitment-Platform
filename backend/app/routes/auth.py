"""
app/routes/auth.py
─────────────────────────────────────────────────────────────────────────────
Authentication endpoints: register, login, and current-user retrieval.
"""

from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.auth_service import login_user, register_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register(payload: RegisterRequest) -> TokenResponse:
    """
    Create a new user account and return a JWT access token.

    - **full_name**: Display name
    - **email**: Must be unique
    - **password**: Minimum 8 characters
    """
    return await register_user(payload)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and get a JWT token",
)
async def login(payload: LoginRequest) -> TokenResponse:
    """
    Authenticate with email + password and receive a JWT access token.
    """
    return await login_user(payload.email, payload.password)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the authenticated user's account info",
)
async def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """
    Returns the authenticated user's account details.
    Requires a valid Bearer token.
    """
    return UserResponse(
        id=str(current_user.id),
        full_name=current_user.full_name,
        email=current_user.email,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
    )


from app.schemas.settings import PasswordUpdate
from app.services.auth_service import update_password

@router.put(
    "/password",
    summary="Update user password",
)
async def update_user_password(
    payload: PasswordUpdate,
    current_user: User = Depends(get_current_user),
) -> dict:
    """Update the authenticated user's password."""
    await update_password(str(current_user.id), payload.current_password, payload.new_password)
    return {"success": True, "message": "Password updated successfully"}
