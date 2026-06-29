"""Project assignments routes — port of project-assignments.controller.ts."""
from __future__ import annotations

from typing import Optional

from uuid import UUID

from fastapi import APIRouter, Query

from app.core.deps import AuthenticatedUser, CurrentUser
from app.core.exceptions import BadRequestError
from app.modules.project_assignments import service
from app.modules.project_assignments.schemas import (
    ProjectAssignmentCreate,
    ProjectAssignmentUpdate,
)

router = APIRouter(prefix="/project-assignments", tags=["project-assignments"])


@router.get("", summary="List project assignments by projectId or workerId")
async def find_all(
    user: AuthenticatedUser = CurrentUser,
    projectId: Optional[str] = Query(default=None),
    workerId: Optional[str] = Query(default=None),
):
    if workerId:
        return await service.find_by_worker(user, workerId)
    if projectId:
        return await service.find_by_project(user, projectId)
    raise BadRequestError("Provide projectId or workerId")


@router.post("", status_code=201, summary="Create a project assignment")
async def create(
    dto: ProjectAssignmentCreate,
    user: AuthenticatedUser = CurrentUser,
):
    return await service.create(user, dto)


@router.patch("/{id}", summary="Update a project assignment")
async def update(
    id: UUID,
    dto: ProjectAssignmentUpdate,
    user: AuthenticatedUser = CurrentUser,
):
    return await service.update(user, str(id), dto)


@router.delete("/{id}", status_code=200, summary="Remove a project assignment")
async def remove(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.remove(user, str(id))
