"""
app/models/user.py
─────────────────────────────────────────────────────────────────────────────
Beanie document model for registered users.
Stores auth credentials only — profile data lives in Profile.
"""

from datetime import datetime
from typing import Optional

from beanie import Document, Indexed
from pydantic import EmailStr, Field


class User(Document):
    """Represents an authenticated account."""

    email: Indexed(EmailStr, unique=True)  # type: ignore[valid-type]
    full_name: str
    hashed_password: str
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        # Ensure unique index on email
        indexes = ["email"]
