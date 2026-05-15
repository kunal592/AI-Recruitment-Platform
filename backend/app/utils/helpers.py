"""
app/utils/helpers.py
─────────────────────────────────────────────────────────────────────────────
Miscellaneous utility functions shared across the codebase.
"""

import re
from datetime import datetime
from typing import Any, Dict


def sanitize_filename(filename: str) -> str:
    """Remove characters unsafe for filesystem paths."""
    return re.sub(r"[^\w.\-]", "_", filename)


def model_to_dict(doc: Any, exclude_fields: list[str] | None = None) -> Dict[str, Any]:
    """
    Convert a Beanie document to a plain dict.
    Converts ObjectId → str for JSON serialisation.
    """
    data = doc.model_dump()
    # Stringify the Beanie `id` field
    if "_id" in data:
        data["id"] = str(data.pop("_id"))
    elif "id" in data and data["id"] is not None:
        data["id"] = str(data["id"])

    for field in (exclude_fields or []):
        data.pop(field, None)
    return data


def parse_iso_datetime(dt_str: str) -> datetime:
    """
    Parse an ISO 8601 datetime string to a Python datetime.
    Handles both 'Z' suffix and '+00:00' offset.
    """
    dt_str = dt_str.replace("Z", "+00:00")
    return datetime.fromisoformat(dt_str)


def truncate(text: str, max_chars: int = 500) -> str:
    """Truncate a string to max_chars, appending '…' if cut."""
    return text if len(text) <= max_chars else text[:max_chars] + "…"
