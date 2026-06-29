"""Proof submissions routes — port of proof-submissions.controller.ts.

@Controller('proof-submissions'). All routes require an authenticated user.
The PATCH route is the review/approval transition (status + reviewer).
"""
from __future__ import annotations

from typing import Optional

from uuid import UUID

from fastapi import APIRouter, Query

from app.core.deps import AuthenticatedUser, CurrentUser
from app.modules.proof_submissions import service
from app.modules.proof_submissions.schemas import (
    ProofSubmissionCreate,
    ProofSubmissionUpdate,
)

router = APIRouter(prefix="/proof-submissions", tags=["proof-submissions"])


@router.get("", summary="List payment proof submissions")
async def find_all(
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.find_all(user, organizationId)


@router.get("/{id}", summary="Get a single proof submission by ID")
async def find_one(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.find_one(user, str(id))


@router.post("", status_code=201, summary="Create a payment proof submission")
async def create(
    dto: ProofSubmissionCreate,
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.create(user, dto, organizationId or "")


@router.patch("/{id}", summary="Review a proof submission (approve/reject/update)")
async def update(
    id: UUID, dto: ProofSubmissionUpdate, user: AuthenticatedUser = CurrentUser
):
    return await service.update(user, str(id), dto)


@router.delete("/{id}", status_code=200, summary="Delete a proof submission")
async def remove(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.remove(user, str(id))
