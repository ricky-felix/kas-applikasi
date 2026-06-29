"""Material-requests service — port of material-requests.service.ts.

Reproduces the org-scoped read rules: super_admin sees everything, org
owner/admin see their org's requests, other members see only requests they
created themselves.
"""
from __future__ import annotations

from typing import Optional

from prisma.enums import MaterialRequestStatus

from app.core.database import db
from app.core.deps import AuthenticatedUser
from app.core.exceptions import NotFoundError
from app.core.org_scope import assert_org_admin, is_super_admin, resolve_org_id


async def find_all(user: AuthenticatedUser, org_id: Optional[str]):
    if is_super_admin(user):
        return await db.materialrequest.find_many(
            where={"organizationId": org_id} if org_id else None,
            include={
                "project": {"select": {"id": True, "title": True}},
                "material": {"select": {"id": True, "name": True}},
                "requester": {"select": {"id": True, "name": True}},
            },
            order={"createdAt": "desc"},
        )

    resolved = resolve_org_id(user, org_id)
    membership = next(
        (o for o in user.organizations if o.organizationId == resolved), None
    )
    if membership and membership.role in ("owner", "admin"):
        where = {"organizationId": resolved}
    else:
        where = {"organizationId": resolved, "requestedBy": user.id}

    return await db.materialrequest.find_many(
        where=where,
        include={
            "project": {"select": {"id": True, "title": True}},
            "material": {"select": {"id": True, "name": True}},
        },
        order={"createdAt": "desc"},
    )


async def find_one(user: AuthenticatedUser, request_id: str):
    mr = await db.materialrequest.find_unique(
        where={"id": request_id},
        include={
            "project": True,
            "material": True,
            "requester": {"select": {"id": True, "name": True, "email": True}},
        },
    )
    if not mr:
        raise NotFoundError("Material request not found")
    if not is_super_admin(user) and user.id != mr.requestedBy:
        assert_org_admin(user, mr.organizationId)
    return mr


async def create(user: AuthenticatedUser, dto, org_id: str):
    resolved = resolve_org_id(user, org_id or None)
    project = await db.project.find_unique(where={"id": dto.projectId})
    if not project:
        raise NotFoundError("Project not found")

    data = {
        "organizationId": resolved,
        "projectId": dto.projectId,
        "materialId": dto.materialId,
        "materialName": dto.materialName,
        "quantity": dto.quantity,
        "unit": dto.unit,
        "status": dto.status or MaterialRequestStatus.pending,
        "requestedBy": user.id,
        "notes": dto.notes,
    }
    return await db.materialrequest.create(
        data=data,
        include={"project": {"select": {"id": True, "title": True}}},
    )


async def update(user: AuthenticatedUser, request_id: str, dto):
    mr = await db.materialrequest.find_unique(where={"id": request_id})
    if not mr:
        raise NotFoundError("Material request not found")
    assert_org_admin(user, mr.organizationId)

    # The original service writes only these fields; unset DTO fields are
    # `undefined` in NestJS and ignored by Prisma, so exclude_unset reproduces
    # that (omitted keys stay untouched).
    allowed = ("materialName", "quantity", "unit", "status", "reviewedBy", "notes")
    provided = dto.model_dump(exclude_unset=True)
    data = {k: provided[k] for k in allowed if k in provided}
    return await db.materialrequest.update(
        where={"id": request_id},
        data=data,
        include={"project": {"select": {"id": True, "title": True}}},
    )


async def remove(user: AuthenticatedUser, request_id: str):
    mr = await db.materialrequest.find_unique(where={"id": request_id})
    if not mr:
        raise NotFoundError("Material request not found")
    assert_org_admin(user, mr.organizationId)
    await db.materialrequest.delete(where={"id": request_id})
    return {"message": "Material request deleted"}
