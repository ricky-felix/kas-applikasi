"""Field reports routes — port of field-reports.controller.ts
(@Controller('field-reports'))."""
from __future__ import annotations

from typing import Optional

from uuid import UUID

from fastapi import APIRouter, Query

from app.core.deps import AuthenticatedUser, CurrentUser
from app.modules.field_reports import service
from app.modules.field_reports.schemas import (
    CreateAttachmentDto,
    CreateFieldReportDto,
    UpdateFieldReportDto,
)

router = APIRouter(prefix="/field-reports", tags=["field-reports"])


@router.get("", summary="List field reports scoped to the authenticated user")
async def find_all(
    user: AuthenticatedUser = CurrentUser,
    projectId: Optional[str] = Query(default=None),
):
    return await service.find_all(user, projectId)


@router.get("/{id}", summary="Get a single field report by ID")
async def find_one(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.find_one(user, str(id))


@router.post("", status_code=201, summary="Create a new field report")
async def create(dto: CreateFieldReportDto, user: AuthenticatedUser = CurrentUser):
    return await service.create(user, dto)


@router.patch("/{id}", summary="Update a field report")
async def update(
    id: UUID, dto: UpdateFieldReportDto, user: AuthenticatedUser = CurrentUser
):
    return await service.update(user, str(id), dto)


@router.delete("/{id}", status_code=200, summary="Delete a field report")
async def remove(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.remove(user, str(id))


@router.post(
    "/{id}/attachments",
    status_code=201,
    summary="Add an attachment to a field report",
)
async def add_attachment(
    id: UUID, dto: CreateAttachmentDto, user: AuthenticatedUser = CurrentUser
):
    return await service.add_attachment(user, str(id), dto)


@router.delete(
    "/attachments/{attachmentId}",
    status_code=200,
    summary="Remove a field report attachment",
)
async def remove_attachment(
    attachmentId: UUID, user: AuthenticatedUser = CurrentUser
):
    return await service.remove_attachment(user, str(attachmentId))
