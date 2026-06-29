"""Field workers routes — port of field-workers.controller.ts.

@Controller('field-workers'), ApiBearerAuth — all endpoints authenticated.
"""
from __future__ import annotations

from typing import Optional

from uuid import UUID

from fastapi import APIRouter, Query

from app.core.deps import AuthenticatedUser, CurrentUser
from app.modules.field_workers import service
from app.modules.field_workers.schemas import FieldWorkerCreate, FieldWorkerUpdate

router = APIRouter(prefix="/field-workers", tags=["field-workers"])


@router.get(
    "/with-profile",
    summary="List field workers with user profile (name, email, phone)",
)
async def find_with_profile(
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.find_all(user, organizationId)


@router.get("", summary="List field workers scoped to the authenticated user")
async def find_all(
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.find_all(user, organizationId)


@router.get("/{id}", summary="Get a single field worker by ID")
async def find_one(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.find_one(user, str(id))


@router.post("", status_code=201, summary="Create a new field worker")
async def create(
    dto: FieldWorkerCreate,
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.create(user, dto, organizationId or "")


@router.patch("/{id}", summary="Update a field worker")
async def update(
    id: UUID, dto: FieldWorkerUpdate, user: AuthenticatedUser = CurrentUser
):
    return await service.update(user, str(id), dto)


@router.delete("/{id}", summary="Delete a field worker")
async def remove(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.remove(user, str(id))
