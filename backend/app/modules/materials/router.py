"""Materials routes — port of materials.controller.ts (@Controller('materials'))."""
from __future__ import annotations

from typing import Optional

from uuid import UUID

from fastapi import APIRouter, Query

from app.core.deps import AuthenticatedUser, CurrentUser
from app.modules.materials import service
from app.modules.materials.schemas import MaterialCreate, MaterialUpdate

router = APIRouter(prefix="/materials", tags=["materials"])


@router.get("", summary="List materials for an organization")
async def find_all(
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.find_all(user, organizationId)


@router.get("/{id}", summary="Get a single material by ID")
async def find_one(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.find_one(user, str(id))


@router.post("", status_code=201, summary="Create a new material")
async def create(
    dto: MaterialCreate,
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.create(user, dto, organizationId or "")


@router.patch("/{id}", summary="Update a material")
async def update(id: UUID, dto: MaterialUpdate, user: AuthenticatedUser = CurrentUser):
    return await service.update(user, str(id), dto)


@router.delete("/{id}", summary="Delete a material")
async def remove(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.remove(user, str(id))
