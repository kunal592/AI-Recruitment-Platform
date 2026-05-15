"""
app/config/settings.py
─────────────────────────────────────────────────────────────────────────────
Central configuration using pydantic-settings.
All values are loaded from environment variables / .env file.
"""

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────────────────
    app_name: str = Field(default="AI Recruitment Platform")
    app_version: str = Field(default="1.0.0")
    debug: bool = Field(default=False)
    environment: str = Field(default="development")

    # ── Server ───────────────────────────────────────────────────────────────
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)

    # ── MongoDB ──────────────────────────────────────────────────────────────
    mongodb_url: str = Field(default="mongodb://localhost:27017")
    mongodb_db_name: str = Field(default="recruitment_platform")

    # ── JWT ──────────────────────────────────────────────────────────────────
    secret_key: str = Field(default="change-me-in-production-use-32-chars-minimum")
    algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=1440)  # 24 hours

    # ── Gemini AI ────────────────────────────────────────────────────────────
    gemini_api_key: str = Field(default="")
    gemini_model: str = Field(default="gemini-1.5-flash")

    # ── Qwen AI (Fallback) ───────────────────────────────────────────────────
    qwen_api_url: str = Field(default="http://46.28.44.37:4000/v1")
    qwen_api_key: str = Field(default="anything")
    qwen_model: str = Field(default="qwen")

    # ── Job APIs ─────────────────────────────────────────────────────────────
    jsearch_api_key: str = Field(default="")
    remoteok_api_url: str = Field(default="https://remoteok.com/api")

    # ── File Storage ─────────────────────────────────────────────────────────
    upload_dir: str = Field(default="uploads")
    max_file_size_mb: int = Field(default=10)

    # ── CORS ─────────────────────────────────────────────────────────────────
    allowed_origins: str = Field(default="http://localhost:3000,http://localhost:5173")

    # ── Scheduler ────────────────────────────────────────────────────────────
    scheduler_timezone: str = Field(default="UTC")

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse comma-separated CORS origins into a list."""
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance — call this everywhere instead of instantiating."""
    return Settings()


# Convenience singleton used across the app
settings = get_settings()
