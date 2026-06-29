"""Requests routes — port of requests.controller.ts (@Controller('requests'))."""
from __future__ import annotations

from typing import Optional

from uuid import UUID

from fastapi import APIRouter, Query, status

from app.core.deps import AuthenticatedUser, CurrentUser
from app.modules.requests import service
from app.modules.requests.schemas import RequestCreate, RequestUpdate

router = APIRouter(prefix="/requests", tags=["requests"])


@router.get("", summary="List requests scoped to the authenticated user")
async def find_all(
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.find_all(user, organizationId)


@router.get("/{id}", summary="Get a single request by ID")
async def find_one(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.find_one(user, str(id))


@router.post("", status_code=201, summary="Create a new request")
async def create(
    dto: RequestCreate,
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.create(user, dto, organizationId or "")


@router.patch("/{id}", summary="Update a request (incl. status review/approval)")
async def update(id: UUID, dto: RequestUpdate, user: AuthenticatedUser = CurrentUser):
    return await service.update(user, str(id), dto)


@router.delete("/{id}", status_code=status.HTTP_200_OK, summary="Delete a request")
async def remove(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.remove(user, str(id))
