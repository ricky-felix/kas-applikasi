"""Project-materials routes — port of project-materials.controller.ts
(@Controller('project-materials'))."""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query

from app.core.deps import AuthenticatedUser, CurrentUser
from app.modules.project_materials import service
from app.modules.project_materials.schemas import (
    ProjectMaterialCreate,
    ProjectMaterialUpdate,
)

router = APIRouter(prefix="/project-materials", tags=["project-materials"])


@router.get("", summary="List materials for a project")
async def find_by_project(
    projectId: UUID = Query(...),
    user: AuthenticatedUser = CurrentUser,
):
    return await service.find_by_project(user, str(projectId))


@router.post("", status_code=201, summary="Add a material to a project")
async def create(dto: ProjectMaterialCreate, user: AuthenticatedUser = CurrentUser):
    return await service.create(user, dto)


@router.patch("/{id}", summary="Update a project material")
async def update(
    id: UUID,
    dto: ProjectMaterialUpdate,
    user: AuthenticatedUser = CurrentUser,
):
    return await service.update(user, str(id), dto)


@router.delete("/{id}", summary="Remove a material from a project")
async def remove(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.remove(user, str(id))
