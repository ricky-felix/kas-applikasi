"""Cash advances routes — port of cash-advances.controller.ts (@Controller('cash-advances'))."""
from __future__ import annotations

from typing import Optional

from uuid import UUID

from fastapi import APIRouter, Query

from app.core.deps import AuthenticatedUser, CurrentUser
from app.modules.cash_advances import service
from app.modules.cash_advances.schemas import CashAdvanceCreate, CashAdvanceUpdate

router = APIRouter(prefix="/cash-advances", tags=["cash-advances"])


@router.get("", summary="List cash advances (workers see own; admins see org)")
async def find_all(
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.find_all(user, organizationId)


@router.get("/{id}", summary="Get a single cash advance by ID")
async def find_one(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.find_one(user, str(id))


@router.post("", status_code=201, summary="Create a new cash advance")
async def create(
    dto: CashAdvanceCreate,
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.create(user, dto, organizationId or "")


@router.patch("/{id}", summary="Update a cash advance")
async def update(
    id: UUID, dto: CashAdvanceUpdate, user: AuthenticatedUser = CurrentUser
):
    return await service.update(user, str(id), dto)


@router.delete("/{id}", summary="Delete a cash advance")
async def remove(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.remove(user, str(id))
