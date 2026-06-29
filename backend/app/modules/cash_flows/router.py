"""Cash-flows routes — port of cash-flows.controller.ts (@Controller('cash-flows'))."""
from __future__ import annotations

from typing import Optional

from uuid import UUID

from fastapi import APIRouter, Query

from app.core.deps import AuthenticatedUser, CurrentUser
from app.modules.cash_flows import service
from app.modules.cash_flows.schemas import CashFlowCreate, CashFlowUpdate

router = APIRouter(prefix="/cash-flows", tags=["cash-flows"])


@router.get("/summary", summary="Get cash flow summary (income/expense/net)")
async def get_summary(
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.get_summary(user, organizationId)


@router.get("", summary="List all cash flows scoped to the authenticated user")
async def find_all(
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.find_all(user, organizationId)


@router.get("/{id}", summary="Get a single cash flow by ID")
async def find_one(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.find_one(user, str(id))


@router.post("", status_code=201, summary="Create a new cash flow")
async def create(
    dto: CashFlowCreate,
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.create(user, dto, organizationId or "")


@router.patch("/{id}", summary="Update a cash flow")
async def update(id: UUID, dto: CashFlowUpdate, user: AuthenticatedUser = CurrentUser):
    return await service.update(user, str(id), dto)


@router.delete("/{id}", summary="Delete a cash flow")
async def remove(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.remove(user, str(id))
