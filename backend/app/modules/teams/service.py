"""Teams service — port of teams.service.ts.

Reproduces org-scoped access rules and team-member management exactly as the
original NestJS service.
"""
from __future__ import annotations

from typing import Optional

from app.core.database import db
from app.core.deps import AuthenticatedUser
from app.core.exceptions import NotFoundError
from app.core.org_scope import assert_org_admin, is_super_admin, resolve_org_id
from app.core.utils import clean
from app.modules.teams.schemas import AddTeamMember, TeamCreate, TeamUpdate


async def find_all(user: AuthenticatedUser, org_id: Optional[str]):
    if is_super_admin(user):
        return await db.team.find_many(
            where={"organizationId": org_id} if org_id else None,
            include={"members": True},
        )

    resolved = resolve_org_id(user, org_id)
    assert_org_admin(user, resolved)
    return await db.team.find_many(
        where={"organizationId": resolved},
        include={"members": True},
    )


async def find_one(user: AuthenticatedUser, team_id: str):
    team = await db.team.find_unique(
        where={"id": team_id},
        include={
            "members": {
                "include": {"worker": {"select": {"id": True, "role": True}}},
            },
        },
    )
    if not team:
        raise NotFoundError("Team not found")
    if not is_super_admin(user):
        assert_org_admin(user, team.organizationId)
    return team


async def create(user: AuthenticatedUser, dto: TeamCreate, org_id: str):
    resolved = resolve_org_id(user, org_id or None)
    assert_org_admin(user, resolved)
    data = clean(dto.model_dump(exclude_unset=True))
    data["organizationId"] = resolved
    return await db.team.create(data=data)


async def update(user: AuthenticatedUser, team_id: str, dto: TeamUpdate):
    team = await db.team.find_unique(where={"id": team_id})
    if not team:
        raise NotFoundError("Team not found")
    assert_org_admin(user, team.organizationId)
    data = clean(dto.model_dump(exclude_unset=True))
    return await db.team.update(where={"id": team_id}, data=data)


async def remove(user: AuthenticatedUser, team_id: str):
    team = await db.team.find_unique(where={"id": team_id})
    if not team:
        raise NotFoundError("Team not found")
    assert_org_admin(user, team.organizationId)
    await db.team.delete(where={"id": team_id})
    return {"message": "Team deleted"}


async def add_member(user: AuthenticatedUser, team_id: str, dto: AddTeamMember):
    team = await db.team.find_unique(where={"id": team_id})
    if not team:
        raise NotFoundError("Team not found")
    assert_org_admin(user, team.organizationId)
    return await db.teammember.create(
        data={"teamId": team_id, "workerId": dto.workerId, "role": dto.role},
    )


async def remove_member(user: AuthenticatedUser, team_id: str, worker_id: str):
    team = await db.team.find_unique(where={"id": team_id})
    if not team:
        raise NotFoundError("Team not found")
    assert_org_admin(user, team.organizationId)
    await db.teammember.delete_many(where={"teamId": team_id, "workerId": worker_id})
    return {"message": "Member removed"}
