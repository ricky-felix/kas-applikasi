"""Projects routes — port of projects.controller.ts (@Controller('projects'))."""
from __future__ import annotations

from typing import Optional

from uuid import UUID

from fastapi import APIRouter, Query

from app.core.deps import AuthenticatedUser, CurrentUser
from app.modules.projects import service
from app.modules.projects.schemas import ProjectCreate, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", summary="List all projects scoped to the authenticated user")
async def find_all(
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.find_all(user, organizationId)


@router.get("/{id}", summary="Get a single project by ID")
async def find_one(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.find_one(user, str(id))


@router.post("", status_code=201, summary="Create a new project")
async def create(
    dto: ProjectCreate,
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.create(user, dto, organizationId or "")


@router.patch("/{id}", summary="Update a project")
async def update(id: UUID, dto: ProjectUpdate, user: AuthenticatedUser = CurrentUser):
    return await service.update(user, str(id), dto)


@router.delete("/{id}", summary="Delete a project")
async def remove(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.remove(user, str(id))
