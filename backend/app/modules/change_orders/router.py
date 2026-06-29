"""Change orders routes — port of change-orders.controller.ts
(@Controller('change-orders')).
"""
from __future__ import annotations

from typing import Optional

from uuid import UUID

from fastapi import APIRouter, Query

from app.core.deps import AuthenticatedUser, CurrentUser
from app.modules.change_orders import service
from app.modules.change_orders.schemas import ChangeOrderCreate, ChangeOrderUpdate

router = APIRouter(prefix="/change-orders", tags=["change-orders"])


@router.get("", summary="List change orders")
async def find_all(
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.find_all(user, organizationId)


@router.get("/{id}", summary="Get a single change order by ID")
async def find_one(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.find_one(user, str(id))


@router.post("", status_code=201, summary="Create a new change order")
async def create(
    dto: ChangeOrderCreate,
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.create(user, dto, organizationId or "")


@router.patch("/{id}", summary="Update a change order")
async def update(
    id: UUID, dto: ChangeOrderUpdate, user: AuthenticatedUser = CurrentUser
):
    return await service.update(user, str(id), dto)


@router.delete("/{id}", summary="Delete a change order")
async def remove(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.remove(user, str(id))
