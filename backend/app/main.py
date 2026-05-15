"""
app/main.py
─────────────────────────────────────────────────────────────────────────────
FastAPI application factory.

Startup sequence:
  1. Connect to MongoDB (Motor + Beanie)
  2. Start APScheduler
  3. Launch Playwright Chromium browser
  4. Register all routers

Shutdown sequence:
  1. Stop Playwright browser
  2. Stop APScheduler
  3. Disconnect MongoDB
"""

import sys
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger

from app.automation.browser import BrowserManager
from app.config.settings import settings
from app.database.connection import Database
from app.middleware.error_handler import register_exception_handlers
from app.routes import api_router
from app.scheduler.reminder_scheduler import shutdown_scheduler, start_scheduler

# ── Logger configuration ─────────────────────────────────────────────────────
logger.remove()
logger.add(
    sys.stderr,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> — <level>{message}</level>",
    level="DEBUG" if settings.debug else "INFO",
    colorize=True,
)
logger.add(
    "logs/app.log",
    rotation="10 MB",
    retention="14 days",
    level="INFO",
    enqueue=True,
)


# ── Lifespan context manager ─────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage startup and shutdown of all background services."""

    # ── STARTUP ──────────────────────────────────────────────────────────────
    logger.info("=" * 60)
    logger.info("  {} v{}", settings.app_name, settings.app_version)
    logger.info("  Environment : {}", settings.environment)
    logger.info("=" * 60)

    # Ensure upload directory exists
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    Path("logs").mkdir(exist_ok=True)

    # MongoDB
    await Database.connect()

    # APScheduler
    start_scheduler()

    # Playwright — headless=True for production; set False for local demo
    headless = settings.environment != "development" or True
    await BrowserManager.start(headless=headless)

    logger.success("All services started. API is ready.")

    yield  # ←─── Application runs here

    # ── SHUTDOWN ─────────────────────────────────────────────────────────────
    logger.info("Shutting down services …")

    await BrowserManager.stop()
    shutdown_scheduler()
    await Database.disconnect()

    logger.info("Shutdown complete. Goodbye.")


# ── Application factory ──────────────────────────────────────────────────────

def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="""
## AI-Powered Recruitment Automation Platform

A full-stack backend for automating the entire job hunt lifecycle:

| Feature | Endpoint Prefix |
|---|---|
| Authentication (JWT) | `/auth` |
| Resume Upload + AI Parsing | `/resume` |
| User Profile Management | `/profile` |
| Job Discovery & Search | `/jobs` |
| AI Job Recommendations | `/jobs/recommendations` |
| AI Resume Customiser | `/ai/customize-resume` |
| AI Email Generator | `/ai/generate-email` |
| AI Study Plan Generator | `/ai/study-plan` |
| Mock Interview Chatbot | `/interview` |
| Playwright Auto-Apply | `/automation/auto-apply` |
| Reminder Scheduler | `/scheduler/reminder` |

All protected endpoints require a **Bearer token** obtained from `/auth/login`.
        """,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS ─────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Exception handlers ───────────────────────────────────────────────────
    register_exception_handlers(app)

    # ── Routers ──────────────────────────────────────────────────────────────
    app.include_router(api_router)

    # ── Static files (screenshots, uploaded resumes preview) ─────────────────
    uploads_dir = Path(settings.upload_dir)
    uploads_dir.mkdir(exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

    # ── Health check ─────────────────────────────────────────────────────────
    @app.get("/health", tags=["System"], summary="Health check")
    async def health_check() -> dict:
        return {
            "status": "healthy",
            "app": settings.app_name,
            "version": settings.app_version,
            "environment": settings.environment,
        }

    return app


# Instantiate the app (imported by Uvicorn)
app = create_app()


# ── Dev entry point ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="debug" if settings.debug else "info",
    )
