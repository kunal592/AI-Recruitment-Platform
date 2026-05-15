"""
app/routes/__init__.py
─────────────────────────────────────────────────────────────────────────────
Aggregates all routers so main.py only needs one import.
"""

from fastapi import APIRouter

from app.routes.ai_routes import router as ai_router
from app.routes.auth import router as auth_router
from app.routes.automation import router as automation_router
from app.routes.interview import router as interview_router
from app.routes.jobs import router as jobs_router
from app.routes.profile import router as profile_router
from app.routes.resume import router as resume_router
from app.routes.scheduler import router as scheduler_router

# Master router — prefix "" means each sub-router owns its own prefix
api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(resume_router)
api_router.include_router(profile_router)
api_router.include_router(jobs_router)
api_router.include_router(ai_router)
api_router.include_router(interview_router)
api_router.include_router(automation_router)
api_router.include_router(scheduler_router)

__all__ = ["api_router"]
