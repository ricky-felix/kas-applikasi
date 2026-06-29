"""Change orders service — port of change-orders.service.ts.

Reproduces the same org-scoped rules: super_admin sees everything (optionally
filtered by org), org admins see/manage their org's change orders. The
ChangeOrder model carries requester/reviewer User relations which are included
exactly as in the original.
"""
from __future__ import annotations

from typing import Optional

from prisma.enums import ChangeOrderStatus

from app.core.database import db
from app.core.deps import AuthenticatedUser
from app.core.exceptions import NotFoundError
from app.core.org_scope import assert_org_admin, is_super_admin, resolve_org_id
from app.core.utils import parse_dt
from app.modules.change_orders.schemas import ChangeOrderCreate, ChangeOrderUpdate


async def find_all(user: AuthenticatedUser, org_id: Optional[str]):
    if is_super_admin(user):
        return await db.changeorder.find_many(
            where={"organizationId": org_id} if org_id else None,
            include={
                "project": True,
                "requester": True,
            },
            order={"createdAt": "desc"},
        )

    resolved = resolve_org_id(user, org_id)
    assert_org_admin(user, resolved)
    return await db.changeorder.find_many(
        where={"organizationId": resolved},
        include={
            "project": True,
            "requester": True,
        },
        order={"createdAt": "desc"},
    )


async def find_one(user: AuthenticatedUser, change_order_id: str):
    co = await db.changeorder.find_unique(
        where={"id": change_order_id},
        include={
            "project": True,
            "requester": True,
            "reviewer": True,
        },
    )
    if not co:
        raise NotFoundError("Change order not found")
    if not is_super_admin(user):
        assert_org_admin(user, co.organizationId)
    return co


async def create(user: AuthenticatedUser, dto: ChangeOrderCreate, org_id: str):
    resolved = resolve_org_id(user, org_id or None)
    project = await db.project.find_unique(where={"id": dto.projectId})
    if not project:
        raise NotFoundError("Project not found")

    data = {
        "organizationId": resolved,
        "projectId": dto.projectId,
        "title": dto.title,
        "description": dto.description,
        "amount": dto.amount,
        "status": dto.status or ChangeOrderStatus.pending,
        "requestedBy": user.id,
    }
    return await db.changeorder.create(
        data=data,
        include={"project": True},
    )


async def update(user: AuthenticatedUser, change_order_id: str, dto: ChangeOrderUpdate):
    co = await db.changeorder.find_unique(where={"id": change_order_id})
    if not co:
        raise NotFoundError("Change order not found")
    assert_org_admin(user, co.organizationId)

    data = {
        "title": dto.title,
        "description": dto.description,
        "amount": dto.amount,
        "status": dto.status,
        "reviewedBy": dto.reviewedBy,
        "reviewedAt": parse_dt(dto.reviewedAt) if dto.reviewedAt else None,
    }
    # Mirror Nest: keys with `undefined` are ignored by Prisma. Here unset/None
    # fields are dropped so they aren't written.
    data = {k: v for k, v in data.items() if v is not None}
    return await db.changeorder.update(
        where={"id": change_order_id},
        data=data,
        include={"project": True},
    )


async def remove(user: AuthenticatedUser, change_order_id: str):
    co = await db.changeorder.find_unique(where={"id": change_order_id})
    if not co:
        raise NotFoundError("Change order not found")
    assert_org_admin(user, co.organizationId)
    await db.changeorder.delete(where={"id": change_order_id})
    return {"message": "Change order deleted"}
