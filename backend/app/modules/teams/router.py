"""Teams routes — port of teams.controller.ts (@Controller('teams'))."""
from __future__ import annotations

from typing import Optional

from uuid import UUID

from fastapi import APIRouter, Query

from app.core.deps import AuthenticatedUser, CurrentUser
from app.modules.teams import service
from app.modules.teams.schemas import AddTeamMember, TeamCreate, TeamUpdate

router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("", summary="List all teams scoped to the authenticated user")
async def find_all(
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.find_all(user, organizationId)


@router.get("/{id}", summary="Get a single team by ID")
async def find_one(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.find_one(user, str(id))


@router.post("", status_code=201, summary="Create a new team")
async def create(
    dto: TeamCreate,
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.create(user, dto, organizationId or "")


@router.patch("/{id}", summary="Update a team")
async def update(id: UUID, dto: TeamUpdate, user: AuthenticatedUser = CurrentUser):
    return await service.update(user, str(id), dto)


@router.delete("/{id}", status_code=200, summary="Delete a team")
async def remove(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.remove(user, str(id))


@router.post("/{id}/members", status_code=201, summary="Add a member to a team")
async def add_member(
    id: UUID, dto: AddTeamMember, user: AuthenticatedUser = CurrentUser
):
    return await service.add_member(user, str(id), dto)


@router.delete(
    "/{id}/members/{workerId}",
    status_code=200,
    summary="Remove a member from a team",
)
async def remove_member(
    id: UUID, workerId: UUID, user: AuthenticatedUser = CurrentUser
):
    return await service.remove_member(user, str(id), str(workerId))
