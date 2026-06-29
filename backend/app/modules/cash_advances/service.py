"""Cash advances service — port of cash-advances.service.ts.

Read rules mirror the original: super_admin sees everything (optionally scoped
to an org), org owner/admin see their org's cash advances, other members see
only their own. Reproduces the same Prisma includes (worker/approver selects).
"""
from __future__ import annotations

from typing import Optional

from prisma.enums import CashAdvanceStatus

from app.core.database import db
from app.core.deps import AuthenticatedUser
from app.core.exceptions import NotFoundError
from app.core.org_scope import assert_org_admin, is_super_admin, resolve_org_id
from app.core.utils import parse_dt
from app.modules.cash_advances.schemas import CashAdvanceCreate, CashAdvanceUpdate


async def find_all(user: AuthenticatedUser, org_id: Optional[str]):
    if is_super_admin(user):
        return await db.cashadvance.find_many(
            where={"organizationId": org_id} if org_id else None,
            include={"worker": {"select": {"id": True, "name": True}}},
            order={"createdAt": "desc"},
        )

    resolved = resolve_org_id(user, org_id)
    membership = next(
        (o for o in user.organizations if o.organizationId == resolved), None
    )
    if membership and membership.role in ("owner", "admin"):
        where = {"organizationId": resolved}
    else:
        where = {"organizationId": resolved, "workerId": user.id}

    return await db.cashadvance.find_many(
        where=where,
        include={"worker": {"select": {"id": True, "name": True}}},
        order={"createdAt": "desc"},
    )


async def find_one(user: AuthenticatedUser, ca_id: str):
    ca = await db.cashadvance.find_unique(
        where={"id": ca_id},
        include={
            "worker": {"select": {"id": True, "name": True, "email": True}},
            "approver": {"select": {"id": True, "name": True}},
        },
    )
    if not ca:
        raise NotFoundError("Cash advance not found")
    if not is_super_admin(user) and user.id != ca.workerId:
        assert_org_admin(user, ca.organizationId)
    return ca


async def create(user: AuthenticatedUser, dto: CashAdvanceCreate, org_id: str):
    resolved = resolve_org_id(user, org_id or None)
    return await db.cashadvance.create(
        data={
            "organizationId": resolved,
            "workerId": dto.workerId or user.id,
            "amount": dto.amount,
            "reason": dto.reason,
            "status": dto.status or CashAdvanceStatus.pending,
            "advanceDate": parse_dt(dto.advanceDate),
        },
        include={"worker": {"select": {"id": True, "name": True}}},
    )


async def update(user: AuthenticatedUser, ca_id: str, dto: CashAdvanceUpdate):
    ca = await db.cashadvance.find_unique(where={"id": ca_id})
    if not ca:
        raise NotFoundError("Cash advance not found")
    assert_org_admin(user, ca.organizationId)

    data: dict = {}
    if dto.amount is not None:
        data["amount"] = dto.amount
    if dto.reason is not None:
        data["reason"] = dto.reason
    if dto.status is not None:
        data["status"] = dto.status
    if dto.advanceDate is not None:
        data["advanceDate"] = parse_dt(dto.advanceDate)
    if dto.approvedBy is not None:
        data["approvedBy"] = dto.approvedBy

    return await db.cashadvance.update(
        where={"id": ca_id},
        data=data,
        include={"worker": {"select": {"id": True, "name": True}}},
    )


async def remove(user: AuthenticatedUser, ca_id: str):
    ca = await db.cashadvance.find_unique(where={"id": ca_id})
    if not ca:
        raise NotFoundError("Cash advance not found")
    assert_org_admin(user, ca.organizationId)
    await db.cashadvance.delete(where={"id": ca_id})
    return {"message": "Cash advance deleted"}
