"""Daily allowances service — port of daily-allowances.service.ts.

Org-scoped read rules: super_admin sees everything (optionally filtered by
organizationId), org owner/admin see their org's allowances, other members see
only their own allowances. Writes require owner/admin.
"""
from __future__ import annotations

from typing import Optional

from app.core.database import db
from app.core.deps import AuthenticatedUser
from app.core.exceptions import NotFoundError
from app.core.org_scope import assert_org_admin, is_super_admin, resolve_org_id
from app.core.utils import clean, parse_dt
from app.modules.daily_allowances.schemas import (
    DailyAllowanceCreate,
    DailyAllowanceUpdate,
)


async def find_all(user: AuthenticatedUser, org_id: Optional[str]):
    if is_super_admin(user):
        return await db.dailyallowance.find_many(
            where={"organizationId": org_id} if org_id else None,
            include={
                "worker": {"select": {"id": True, "name": True}},
                "project": {"select": {"id": True, "title": True}},
            },
            order={"allowanceDate": "desc"},
        )

    resolved = resolve_org_id(user, org_id)
    membership = next(
        (o for o in user.organizations if o.organizationId == resolved), None
    )
    if membership and membership.role in ("owner", "admin"):
        where = {"organizationId": resolved}
    else:
        where = {"organizationId": resolved, "workerId": user.id}

    return await db.dailyallowance.find_many(
        where=where,
        include={"project": {"select": {"id": True, "title": True}}},
        order={"allowanceDate": "desc"},
    )


async def find_one(user: AuthenticatedUser, allowance_id: str):
    da = await db.dailyallowance.find_unique(
        where={"id": allowance_id},
        include={
            "worker": {"select": {"id": True, "name": True, "email": True}},
            "project": {"select": {"id": True, "title": True}},
        },
    )
    if not da:
        raise NotFoundError("Daily allowance not found")
    if not is_super_admin(user) and user.id != da.workerId:
        assert_org_admin(user, da.organizationId)
    return da


async def create(user: AuthenticatedUser, dto: DailyAllowanceCreate, org_id: str):
    resolved = resolve_org_id(user, org_id or None)
    assert_org_admin(user, resolved)
    return await db.dailyallowance.create(
        data=clean(
            {
                "organizationId": resolved,
                "workerId": dto.workerId or user.id,
                "projectId": dto.projectId,
                "allowanceType": dto.allowanceType,
                "amount": dto.amount,
                "allowanceDate": parse_dt(dto.allowanceDate),
                "notes": dto.notes,
            }
        ),
        include={"worker": {"select": {"id": True, "name": True}}},
    )


async def update(user: AuthenticatedUser, allowance_id: str, dto: DailyAllowanceUpdate):
    da = await db.dailyallowance.find_unique(where={"id": allowance_id})
    if not da:
        raise NotFoundError("Daily allowance not found")
    assert_org_admin(user, da.organizationId)
    # NestJS passes these fields directly; Prisma ignores `undefined`, so we drop
    # None values (clean) to avoid overwriting existing columns with null.
    data = clean(
        {
            "allowanceType": dto.allowanceType,
            "amount": dto.amount,
            "allowanceDate": parse_dt(dto.allowanceDate) if dto.allowanceDate else None,
            "notes": dto.notes,
        }
    )
    return await db.dailyallowance.update(where={"id": allowance_id}, data=data)


async def remove(user: AuthenticatedUser, allowance_id: str):
    da = await db.dailyallowance.find_unique(where={"id": allowance_id})
    if not da:
        raise NotFoundError("Daily allowance not found")
    assert_org_admin(user, da.organizationId)
    await db.dailyallowance.delete(where={"id": allowance_id})
    return {"message": "Daily allowance deleted"}
