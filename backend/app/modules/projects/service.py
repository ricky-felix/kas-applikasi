"""Projects service — port of projects.service.ts.

Reproduces the same org-scoped read rules: super_admin sees everything, org
owner/admin see their org's projects, other members see only projects they're
assigned to.
"""
from __future__ import annotations

from typing import Optional

from prisma.enums import ProjectStatus

from app.core.database import db
from app.core.deps import AuthenticatedUser
from app.core.exceptions import ForbiddenError, NotFoundError
from app.core.org_scope import assert_org_admin, is_super_admin, resolve_org_id
from app.core.utils import clean, parse_dt
from app.modules.projects.schemas import ProjectCreate, ProjectUpdate


async def find_all(user: AuthenticatedUser, org_id: Optional[str]):
    if is_super_admin(user):
        return await db.project.find_many(
            where={"organizationId": org_id} if org_id else None,
            order={"createdAt": "desc"},
        )

    resolved = resolve_org_id(user, org_id)
    membership = next(
        (o for o in user.organizations if o.organizationId == resolved), None
    )
    if membership and membership.role in ("owner", "admin"):
        return await db.project.find_many(
            where={"organizationId": resolved},
            order={"createdAt": "desc"},
        )

    return await db.project.find_many(
        where={
            "organizationId": resolved,
            "teamAssignments": {"some": {"workerId": user.id}},
        },
        order={"createdAt": "desc"},
    )


async def find_one(user: AuthenticatedUser, project_id: str):
    project = await db.project.find_unique(
        where={"id": project_id},
        include={
            "teamAssignments": {
                "include": {"worker": True, "team": True},
            },
            "projectMaterials": {"include": {"material": True}},
            "fieldReports": {"order": {"reportDate": "desc"}, "take": 10},
        },
    )
    if not project:
        raise NotFoundError("Project not found")
    _assert_can_read(user, project)
    return project


async def create(user: AuthenticatedUser, dto: ProjectCreate, org_id: str):
    resolved = resolve_org_id(user, org_id or None)
    assert_org_admin(user, resolved)
    data = clean(dto.model_dump(exclude_unset=True))
    data["organizationId"] = resolved
    data["createdBy"] = user.id
    data["status"] = dto.status or ProjectStatus.draft
    if "startDate" in data:
        data["startDate"] = parse_dt(data["startDate"])
    if "endDate" in data:
        data["endDate"] = parse_dt(data["endDate"])
    return await db.project.create(data=clean(data))


async def update(user: AuthenticatedUser, project_id: str, dto: ProjectUpdate):
    project = await _find_or_throw(project_id)
    assert_org_admin(user, project.organizationId)
    data = clean(dto.model_dump(exclude_unset=True))
    if "startDate" in data:
        data["startDate"] = parse_dt(data["startDate"])
    if "endDate" in data:
        data["endDate"] = parse_dt(data["endDate"])
    return await db.project.update(where={"id": project_id}, data=clean(data))


async def remove(user: AuthenticatedUser, project_id: str):
    project = await _find_or_throw(project_id)
    assert_org_admin(user, project.organizationId)
    await db.project.delete(where={"id": project_id})
    return {"message": "Project deleted"}


async def _find_or_throw(project_id: str):
    project = await db.project.find_unique(where={"id": project_id})
    if not project:
        raise NotFoundError("Project not found")
    return project


def _assert_can_read(user: AuthenticatedUser, project) -> None:
    if is_super_admin(user):
        return
    membership = next(
        (o for o in user.organizations if o.organizationId == project.organizationId),
        None,
    )
    if membership and membership.role in ("owner", "admin"):
        return
    assignments = project.teamAssignments or []
    if not any(a.workerId == user.id for a in assignments):
        raise ForbiddenError("Access denied to this project")
