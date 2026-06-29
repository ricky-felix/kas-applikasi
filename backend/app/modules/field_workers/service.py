"""Field workers service — port of field-workers.service.ts.

Reproduces the org-scoped access rules: super_admin sees everything, org
owner/admin manage their org's field workers. Reads always include the related
user profile (id, name, email, phone).
"""
from __future__ import annotations

from typing import Optional

from app.core.database import db
from app.core.deps import AuthenticatedUser
from app.core.exceptions import NotFoundError
from app.core.org_scope import assert_org_admin, is_super_admin, resolve_org_id
from app.core.utils import clean, parse_dt
from app.modules.field_workers.schemas import FieldWorkerCreate, FieldWorkerUpdate

# USER_PROFILE_SELECT — { select: { id, name, email, phone } }
USER_PROFILE_SELECT = {"select": {"id": True, "name": True, "email": True, "phone": True}}


async def find_all(user: AuthenticatedUser, org_id: Optional[str]):
    if is_super_admin(user):
        return await db.fieldworker.find_many(
            where={"organizationId": org_id} if org_id else None,
            include={"user": USER_PROFILE_SELECT},
        )

    resolved = resolve_org_id(user, org_id)
    assert_org_admin(user, resolved)
    return await db.fieldworker.find_many(
        where={"organizationId": resolved},
        include={"user": USER_PROFILE_SELECT},
    )


async def find_one(user: AuthenticatedUser, fw_id: str):
    fw = await db.fieldworker.find_unique(
        where={"id": fw_id},
        include={"user": USER_PROFILE_SELECT},
    )
    if not fw:
        raise NotFoundError("Field worker not found")
    if not is_super_admin(user) and user.id != fw_id:
        assert_org_admin(user, fw.organizationId)
    return fw


async def create(user: AuthenticatedUser, dto: FieldWorkerCreate, org_id: str):
    resolved = resolve_org_id(user, org_id or None)
    assert_org_admin(user, resolved)
    data = {
        "id": dto.id,
        "organizationId": resolved,
        "specialization": dto.specialization,
        "status": dto.status,
        "hireDate": parse_dt(dto.hireDate) if dto.hireDate else None,
        "salaryPerDay": dto.salaryPerDay,
        "bankAccount": dto.bankAccount,
        "bankName": dto.bankName,
    }
    return await db.fieldworker.create(
        data=clean(data),
        include={"user": USER_PROFILE_SELECT},
    )


async def update(user: AuthenticatedUser, fw_id: str, dto: FieldWorkerUpdate):
    fw = await db.fieldworker.find_unique(where={"id": fw_id})
    if not fw:
        raise NotFoundError("Field worker not found")
    assert_org_admin(user, fw.organizationId)
    data = clean(dto.model_dump(exclude_unset=True))
    if dto.hireDate:
        data["hireDate"] = parse_dt(dto.hireDate)
    return await db.fieldworker.update(
        where={"id": fw_id},
        data=clean(data),
        include={"user": USER_PROFILE_SELECT},
    )


async def remove(user: AuthenticatedUser, fw_id: str):
    fw = await db.fieldworker.find_unique(where={"id": fw_id})
    if not fw:
        raise NotFoundError("Field worker not found")
    assert_org_admin(user, fw.organizationId)
    await db.fieldworker.delete(where={"id": fw_id})
    return {"message": "Field worker deleted"}
