"""
app/routes/scheduler.py
─────────────────────────────────────────────────────────────────────────────
APScheduler-backed reminder endpoints.
"""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.models.reminder import Reminder
from app.models.user import User
from app.scheduler.reminder_scheduler import cancel_reminder, schedule_reminder
from app.schemas.ai import ReminderRequest, ReminderResponse
from app.utils.helpers import parse_iso_datetime

router = APIRouter(prefix="/scheduler", tags=["Scheduler"])


@router.post(
    "/reminder",
    response_model=ReminderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Schedule a reminder for an interview or follow-up",
)
async def create_reminder(
    payload: ReminderRequest,
    current_user: User = Depends(get_current_user),
) -> ReminderResponse:
    """
    Schedule a one-time reminder that fires at `scheduled_at`.

    - **reminder_type**: `interview` | `follow_up` | `application` | `custom`
    - **scheduled_at**: ISO 8601 UTC datetime, e.g. `2025-09-01T09:00:00`

    On the scheduled time, the reminder is logged (extend with email/push
    notifications by editing `_fire_reminder` in the scheduler module).
    """
    try:
        run_at: datetime = parse_iso_datetime(payload.scheduled_at)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid datetime format. Use ISO 8601, e.g. 2025-09-01T09:00:00",
        )

    # Persist the reminder first so we have an ID
    reminder = Reminder(
        user_id=str(current_user.id),
        title=payload.title,
        message=payload.message,
        reminder_type=payload.reminder_type,
        scheduled_at=run_at,
    )
    await reminder.insert()

    # Register with APScheduler
    job_id = await schedule_reminder(
        reminder_id=str(reminder.id),
        user_id=str(current_user.id),
        title=payload.title,
        message=payload.message,
        run_at=run_at,
    )

    # Store the APScheduler job ID for potential cancellation
    reminder.job_id = job_id
    await reminder.save()

    return ReminderResponse(
        id=str(reminder.id),
        title=reminder.title,
        message=reminder.message,
        reminder_type=reminder.reminder_type,
        scheduled_at=run_at.isoformat(),
        is_sent=reminder.is_sent,
    )


@router.delete(
    "/reminder/{reminder_id}",
    status_code=status.HTTP_200_OK,
    summary="Cancel a scheduled reminder",
)
async def delete_reminder(
    reminder_id: str,
    current_user: User = Depends(get_current_user),
) -> dict:
    """Cancel a pending reminder and remove it from the scheduler."""
    reminder = await Reminder.get(reminder_id)
    if not reminder or reminder.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found.",
        )

    if reminder.is_sent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel a reminder that has already fired.",
        )

    if reminder.job_id:
        cancel_reminder(reminder.job_id)

    reminder.is_cancelled = True
    await reminder.save()
    return {"success": True, "message": "Reminder cancelled."}


@router.get(
    "/reminders",
    summary="List all reminders for the authenticated user",
)
async def list_reminders(
    current_user: User = Depends(get_current_user),
) -> dict:
    """Return all reminders (pending, sent, and cancelled) for the user."""
    reminders = await Reminder.find(
        Reminder.user_id == str(current_user.id)
    ).sort("-scheduled_at").to_list()

    return {
        "reminders": [
            {
                "id": str(r.id),
                "title": r.title,
                "message": r.message,
                "reminder_type": r.reminder_type,
                "scheduled_at": r.scheduled_at.isoformat(),
                "is_sent": r.is_sent,
                "is_cancelled": r.is_cancelled,
            }
            for r in reminders
        ],
        "total": len(reminders),
    }
