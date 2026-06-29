"""Worker registrations routes — port of worker-registrations.controller.ts
(@Controller('worker-registrations'))."""
from __future__ import annotations

from typing import Optional

from uuid import UUID

from fastapi import APIRouter, Query

from app.core.deps import AuthenticatedUser, CurrentUser
from app.modules.worker_registrations import service
from app.modules.worker_registrations.schemas import (
    ApproveWorkerRegistration,
    WorkerRegistrationCreate,
    WorkerRegistrationUpdate,
)

router = APIRouter(prefix="/worker-registrations", tags=["worker-registrations"])


@router.get("", summary="List worker registration requests")
async def find_all(
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.find_all(user, organizationId)


@router.get("/{id}", summary="Get a single worker registration by ID")
async def find_one(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.find_one(user, str(id))


@router.post("", status_code=201, summary="Create a worker registration request")
async def create(
    dto: WorkerRegistrationCreate,
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.create(user, dto, organizationId or "")


@router.post(
    "/{id}/approve",
    status_code=201,
    summary="Approve registration and create field_worker record (transactional)",
)
async def approve(
    id: UUID,
    dto: ApproveWorkerRegistration,
    user: AuthenticatedUser = CurrentUser,
):
    return await service.approve(user, str(id), dto)


@router.patch("/{id}", summary="Update a worker registration")
async def update(
    id: UUID,
    dto: WorkerRegistrationUpdate,
    user: AuthenticatedUser = CurrentUser,
):
    return await service.update(user, str(id), dto)


@router.delete("/{id}", summary="Delete a worker registration")
async def remove(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.remove(user, str(id))
