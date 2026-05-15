"""
app/database/connection.py
─────────────────────────────────────────────────────────────────────────────
Async MongoDB connection using Motor + Beanie ODM.
Provides a single shared client and helper to get collections by name.
"""

from typing import Optional

import motor.motor_asyncio
from beanie import init_beanie
from loguru import logger

from app.config.settings import settings


class Database:
    """Singleton wrapper around the Motor async client."""

    client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
    db: Optional[motor.motor_asyncio.AsyncIOMotorDatabase] = None

    @classmethod
    async def connect(cls) -> None:
        """Open the Motor client and initialise Beanie with all document models."""
        logger.info("Connecting to MongoDB …")
        cls.client = motor.motor_asyncio.AsyncIOMotorClient(
            settings.mongodb_url,
            serverSelectionTimeoutMS=5_000,
        )
        cls.db = cls.client[settings.mongodb_db_name]

        # Import here to avoid circular imports at module load time
        from app.models.user import User
        from app.models.profile import Profile
        from app.models.resume import Resume
        from app.models.job import Job, SavedJob
        from app.models.interview import InterviewSession
        from app.models.study_plan import StudyPlan
        from app.models.reminder import Reminder

        await init_beanie(
            database=cls.db,
            document_models=[
                User,
                Profile,
                Resume,
                Job,
                SavedJob,
                InterviewSession,
                StudyPlan,
                Reminder,
            ],
        )
        logger.success("MongoDB connected — database: {}", settings.mongodb_db_name)

    @classmethod
    async def disconnect(cls) -> None:
        """Close the Motor client gracefully."""
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed.")

    @classmethod
    def get_collection(cls, name: str):
        """Return a raw Motor collection (for queries outside Beanie)."""
        if cls.db is None:
            raise RuntimeError("Database not initialised. Call Database.connect() first.")
        return cls.db[name]


# Module-level shortcut
db = Database()
