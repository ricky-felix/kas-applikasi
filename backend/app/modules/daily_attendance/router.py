"""Daily-attendance routes — port of daily-attendance.controller.ts.

(@Controller('daily-attendance'))
"""
from __future__ import annotations

from typing import Optional

from uuid import UUID

from fastapi import APIRouter, Query

from app.core.deps import AuthenticatedUser, CurrentUser
from app.modules.daily_attendance import service
from app.modules.daily_attendance.schemas import (
    DailyAttendanceCreate,
    DailyAttendanceUpdate,
)

router = APIRouter(prefix="/daily-attendance", tags=["daily-attendance"])


@router.get("", summary="List attendance records scoped to the authenticated user")
async def find_all(
    user: AuthenticatedUser = CurrentUser,
    projectId: Optional[str] = Query(default=None),
):
    return await service.find_all(user, projectId)


@router.get("/{id}", summary="Get a single attendance record by ID")
async def find_one(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.find_one(user, str(id))


@router.post("", status_code=201, summary="Create an attendance record")
async def create(dto: DailyAttendanceCreate, user: AuthenticatedUser = CurrentUser):
    return await service.create(user, dto)


@router.patch("/{id}", summary="Update an attendance record")
async def update(
    id: UUID, dto: DailyAttendanceUpdate, user: AuthenticatedUser = CurrentUser
):
    return await service.update(user, str(id), dto)


@router.delete("/{id}", status_code=200, summary="Delete an attendance record")
async def remove(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.remove(user, str(id))
