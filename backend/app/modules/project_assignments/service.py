"""Project assignments service — port of project-assignments.service.ts.

Operates on the ProjectTeamAssignment model (accessor db.projectteamassignment).
Reproduces the org-scoped read rules and admin-gated writes of the original.
"""
from __future__ import annotations

from app.core.database import db
from app.core.deps import AuthenticatedUser
from app.core.exceptions import ForbiddenError, NotFoundError
from app.core.org_scope import assert_org_admin, is_super_admin
from app.core.utils import parse_dt
from app.modules.project_assignments.schemas import (
    ProjectAssignmentCreate,
    ProjectAssignmentUpdate,
)

_WORKER_SELECT = {"id": True, "name": True, "email": True, "phone": True}


async def find_by_project(user: AuthenticatedUser, project_id: str):
    project = await _get_project(project_id)
    if not is_super_admin(user):
        membership = next(
            (o for o in user.organizations if o.organizationId == project.organizationId),
            None,
        )
        if not membership:
            raise ForbiddenError()
        if membership.role not in ("owner", "admin"):
            return await db.projectteamassignment.find_many(
                where={"projectId": project_id, "workerId": user.id},
                include={"worker": {"select": _WORKER_SELECT}},
            )
    return await db.projectteamassignment.find_many(
        where={"projectId": project_id},
        include={"team": True, "worker": {"select": _WORKER_SELECT}},
    )


async def find_by_worker(user: AuthenticatedUser, worker_id: str):
    if is_super_admin(user):
        return await db.projectteamassignment.find_many(
            where={"workerId": worker_id},
            include={
                "project": True,
                "team": True,
                "worker": {"select": _WORKER_SELECT},
            },
        )

    if user.id == worker_id:
        return await db.projectteamassignment.find_many(
            where={"workerId": worker_id},
            include={"project": True, "team": True},
        )

    org_ids = [
        o.organizationId for o in user.organizations if o.role in ("owner", "admin")
    ]
    return await db.projectteamassignment.find_many(
        where={
            "workerId": worker_id,
            "project": {"organizationId": {"in": org_ids}},
        },
        include={
            "project": True,
            "team": True,
            "worker": {"select": _WORKER_SELECT},
        },
    )


async def create(user: AuthenticatedUser, dto: ProjectAssignmentCreate):
    project = await _get_project(dto.projectId)
    assert_org_admin(user, project.organizationId)
    data = {
        "projectId": dto.projectId,
        "teamId": dto.teamId,
        "workerId": dto.workerId,
        "role": dto.role,
        "assignedDate": parse_dt(dto.assignedDate),
        "expectedEndDate": parse_dt(dto.expectedEndDate),
        "actualEndDate": parse_dt(dto.actualEndDate),
    }
    data = {k: v for k, v in data.items() if v is not None}
    return await db.projectteamassignment.create(data=data)


async def update(user: AuthenticatedUser, assignment_id: str, dto: ProjectAssignmentUpdate):
    assignment = await db.projectteamassignment.find_unique(
        where={"id": assignment_id}
    )
    if not assignment:
        raise NotFoundError("Assignment not found")
    project = await _get_project(assignment.projectId)
    assert_org_admin(user, project.organizationId)
    data = {
        "teamId": dto.teamId,
        "workerId": dto.workerId,
        "role": dto.role,
        "assignedDate": parse_dt(dto.assignedDate),
        "expectedEndDate": parse_dt(dto.expectedEndDate),
        "actualEndDate": parse_dt(dto.actualEndDate),
    }
    data = {k: v for k, v in data.items() if v is not None}
    return await db.projectteamassignment.update(
        where={"id": assignment_id}, data=data
    )


async def remove(user: AuthenticatedUser, assignment_id: str):
    assignment = await db.projectteamassignment.find_unique(
        where={"id": assignment_id}
    )
    if not assignment:
        raise NotFoundError("Assignment not found")
    project = await _get_project(assignment.projectId)
    assert_org_admin(user, project.organizationId)
    await db.projectteamassignment.delete(where={"id": assignment_id})
    return {"message": "Assignment removed"}


async def _get_project(project_id: str):
    project = await db.project.find_unique(where={"id": project_id})
    if not project:
        raise NotFoundError("Project not found")
    return project
