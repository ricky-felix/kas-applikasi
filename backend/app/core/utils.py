"""Small shared helpers for the service layer."""
from __future__ import annotations

from datetime import datetime
from typing import Optional, Union


def parse_dt(value: Optional[Union[str, datetime]]) -> Optional[datetime]:
    """Parse an ISO date/datetime string (e.g. '2024-01-01') into a datetime.

    Mirrors `new Date(dto.field)` in the original services. Returns None for
    falsy input so optional fields are simply omitted from the query.
    """
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return value
    # Accept both 'YYYY-MM-DD' and full ISO-8601 (with optional trailing 'Z').
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def clean(data: dict) -> dict:
    """Drop keys whose value is None (≈ how Prisma ignores `undefined`)."""
    return {k: v for k, v in data.items() if v is not None}
