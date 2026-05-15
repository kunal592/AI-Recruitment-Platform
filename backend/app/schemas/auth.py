"""
app/schemas/auth.py
─────────────────────────────────────────────────────────────────────────────
Pydantic schemas for authentication endpoints.
"""

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Payload for POST /auth/register."""

    full_name: str = Field(..., min_length=2, max_length=100, examples=["Jane Doe"])
    email: EmailStr = Field(..., examples=["jane@example.com"])
    password: str = Field(..., min_length=8, max_length=128, examples=["Str0ngP@ss"])

    model_config = {"json_schema_extra": {"example": {
        "full_name": "Jane Doe",
        "email": "jane@example.com",
        "password": "Str0ngP@ss",
    }}}


class LoginRequest(BaseModel):
    """Payload for POST /auth/login."""

    email: EmailStr
    password: str

    model_config = {"json_schema_extra": {"example": {
        "email": "jane@example.com",
        "password": "Str0ngP@ss",
    }}}


class TokenResponse(BaseModel):
    """Returned on successful login or registration."""

    access_token: str
    token_type: str = "bearer"
    user_id: str
    full_name: str
    email: str


class UserResponse(BaseModel):
    """Returned from GET /auth/me."""

    id: str
    full_name: str
    email: str
    is_active: bool
    is_verified: bool
