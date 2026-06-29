"""Analytics routes — port of analytics.controller.ts (@Controller('analytics'))."""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Query

from app.core.deps import AuthenticatedUser, CurrentUser
from app.modules.analytics import service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get(
    "/dashboard",
    summary="Portfolio dashboard aggregates (super_admin / owner+admin)",
)
async def get_dashboard(
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.get_dashboard(user, organizationId)


@router.get(
    "/finance",
    summary="Finance summary: monthly cash flows, invoice totals, top expense categories",
)
async def get_finance(
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.get_finance(user, organizationId)
