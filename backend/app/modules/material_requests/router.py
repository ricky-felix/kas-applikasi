"""Material-requests routes — port of material-requests.controller.ts
(@Controller('material-requests'))."""
from __future__ import annotations

from typing import Optional

from uuid import UUID

from fastapi import APIRouter, Query

from app.core.deps import AuthenticatedUser, CurrentUser
from app.modules.material_requests import service
from app.modules.material_requests.schemas import (
    MaterialRequestCreate,
    MaterialRequestUpdate,
)

router = APIRouter(prefix="/material-requests", tags=["material-requests"])


@router.get(
    "",
    summary="List material requests (workers see own; admins see org)",
)
async def find_all(
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.find_all(user, organizationId)


@router.get("/{id}", summary="Get a single material request by ID")
async def find_one(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.find_one(user, str(id))


@router.post("", status_code=201, summary="Create a material request")
async def create(
    dto: MaterialRequestCreate,
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.create(user, dto, organizationId or "")


@router.patch("/{id}", summary="Update a material request")
async def update(
    id: UUID,
    dto: MaterialRequestUpdate,
    user: AuthenticatedUser = CurrentUser,
):
    return await service.update(user, str(id), dto)


@router.delete("/{id}", status_code=200, summary="Delete a material request")
async def remove(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.remove(user, str(id))
