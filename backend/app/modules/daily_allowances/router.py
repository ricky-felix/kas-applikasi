"""Daily allowances routes — port of daily-allowances.controller.ts
(@Controller('daily-allowances'))."""
from __future__ import annotations

from typing import Optional

from uuid import UUID

from fastapi import APIRouter, Query

from app.core.deps import AuthenticatedUser, CurrentUser
from app.modules.daily_allowances import service
from app.modules.daily_allowances.schemas import (
    DailyAllowanceCreate,
    DailyAllowanceUpdate,
)

router = APIRouter(prefix="/daily-allowances", tags=["daily-allowances"])


@router.get(
    "",
    summary="List daily allowances (workers see own; admins see org)",
)
async def find_all(
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.find_all(user, organizationId)


@router.get("/{id}", summary="Get a single daily allowance by ID")
async def find_one(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.find_one(user, str(id))


@router.post("", status_code=201, summary="Create a daily allowance")
async def create(
    dto: DailyAllowanceCreate,
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.create(user, dto, organizationId or "")


@router.patch("/{id}", summary="Update a daily allowance")
async def update(
    id: UUID,
    dto: DailyAllowanceUpdate,
    user: AuthenticatedUser = CurrentUser,
):
    return await service.update(user, str(id), dto)


@router.delete("/{id}", summary="Delete a daily allowance")
async def remove(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.remove(user, str(id))
