"""Pydantic request schemas for daily-attendance (ports dto/*.dto.ts).

`extra="forbid"` reproduces NestJS's ValidationPipe forbidNonWhitelisted.
Note: `status` is a plain string (IsString) in the source DTO, not an enum.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class DailyAttendanceCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    projectId: str
    workerId: Optional[str] = None
    attendanceDate: str
    status: Optional[str] = None
    checkInTime: Optional[str] = None
    checkOutTime: Optional[str] = None
    hoursWorked: Optional[float] = Field(default=None, ge=0, le=24)
    notes: Optional[str] = None


class DailyAttendanceUpdate(BaseModel):
    """PartialType(CreateDailyAttendanceDto) — every field optional."""

    model_config = ConfigDict(extra="forbid")

    projectId: Optional[str] = None
    workerId: Optional[str] = None
    attendanceDate: Optional[str] = None
    status: Optional[str] = None
    checkInTime: Optional[str] = None
    checkOutTime: Optional[str] = None
    hoursWorked: Optional[float] = Field(default=None, ge=0, le=24)
    notes: Optional[str] = None
