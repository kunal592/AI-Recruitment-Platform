"""
app/scheduler/reminder_scheduler.py
─────────────────────────────────────────────────────────────────────────────
APScheduler-based reminder system.
Schedules one-time jobs tied to Reminder documents in MongoDB.
On fire: logs the reminder (extend with email/push notifications here).
"""

from datetime import datetime
from typing import Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.date import DateTrigger
from loguru import logger

from app.config.settings import settings

# Shared scheduler instance — started in main.py
scheduler = AsyncIOScheduler(timezone=settings.scheduler_timezone)


# ─── Job function ─────────────────────────────────────────────────────────────

async def _fire_reminder(reminder_id: str, user_id: str, title: str, message: str) -> None:
    """
    Called by APScheduler when a reminder is due.
    Marks the reminder as sent in MongoDB.
    Extend this to send email, push notification, websocket event, etc.
    """
    from app.models.reminder import Reminder  # avoid circular import

    logger.info(
        "⏰ REMINDER FIRED | user={} | title='{}' | msg='{}'",
        user_id, title, message[:80],
    )

    reminder = await Reminder.get(reminder_id)
    if reminder and not reminder.is_sent:
        reminder.is_sent = True
        await reminder.save()


# ─── Public API ───────────────────────────────────────────────────────────────

async def schedule_reminder(
    reminder_id: str,
    user_id: str,
    title: str,
    message: str,
    run_at: datetime,
) -> str:
    """
    Register a one-time APScheduler job.

    Args:
        reminder_id: MongoDB document ID (used as APScheduler job ID prefix).
        user_id:     User the reminder belongs to.
        title:       Short title.
        message:     Full reminder body.
        run_at:      UTC datetime when the reminder should fire.

    Returns:
        APScheduler job ID string.
    """
    job_id = f"reminder_{reminder_id}"

    if run_at <= datetime.utcnow():
        logger.warning("Scheduled time {} is in the past — reminder may fire immediately.", run_at)

    scheduler.add_job(
        _fire_reminder,
        trigger=DateTrigger(run_date=run_at),
        id=job_id,
        args=[reminder_id, user_id, title, message],
        replace_existing=True,
        misfire_grace_time=300,  # 5-minute grace window for missed jobs
    )
    logger.info("Reminder scheduled | job_id={} | run_at={}", job_id, run_at)
    return job_id


def cancel_reminder(job_id: str) -> bool:
    """
    Remove a scheduled reminder from APScheduler.

    Returns True if the job existed and was removed, False otherwise.
    """
    try:
        scheduler.remove_job(job_id)
        logger.info("Reminder cancelled | job_id={}", job_id)
        return True
    except Exception:
        return False


def start_scheduler() -> None:
    """Start the AsyncIOScheduler. Call once at app startup."""
    if not scheduler.running:
        scheduler.start()
        logger.success("APScheduler started (timezone={})", settings.scheduler_timezone)


def shutdown_scheduler() -> None:
    """Shut down the scheduler gracefully."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler stopped.")
