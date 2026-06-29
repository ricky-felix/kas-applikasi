"""Worker registrations service — port of worker-registrations.service.ts.

Org-scoped: super_admin sees everything; otherwise the caller must be an org
admin/owner of the registration's organization. Approval is transactional:
it flips the registration to `approved` AND creates a FieldWorker record.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from prisma.enums import FieldWorkerStatus

from app.core.database import db
from app.core.deps import AuthenticatedUser
from app.core.exceptions import ConflictError, NotFoundError
from app.core.org_scope import assert_org_admin, is_super_admin, resolve_org_id
from app.core.utils import parse_dt
from app.modules.worker_registrations.schemas import (
    ApproveWorkerRegistration,
    WorkerRegistrationCreate,
    WorkerRegistrationUpdate,
)


async def find_all(user: AuthenticatedUser, org_id: Optional[str]):
    if is_super_admin(user):
        return await db.workerregistration.find_many(
            where={"organizationId": org_id} if org_id else None,
            order={"createdAt": "desc"},
        )

    resolved = resolve_org_id(user, org_id)
    assert_org_admin(user, resolved)
    return await db.workerregistration.find_many(
        where={"organizationId": resolved},
        order={"createdAt": "desc"},
    )


async def find_one(user: AuthenticatedUser, reg_id: str):
    reg = await db.workerregistration.find_unique(
        where={"id": reg_id},
        include={"reviewer": {"select": {"id": True, "name": True}}},
    )
    if not reg:
        raise NotFoundError("Worker registration not found")
    if not is_super_admin(user):
        assert_org_admin(user, reg.organizationId)
    return reg


async def create(user: AuthenticatedUser, dto: WorkerRegistrationCreate, org_id: str):
    resolved = resolve_org_id(user, org_id or None)
    return await db.workerregistration.create(
        data={
            "organizationId": resolved,
            "fullName": dto.fullName,
            "phone": dto.phone,
            "specialization": dto.specialization,
        },
    )


async def update(
    user: AuthenticatedUser, reg_id: str, dto: WorkerRegistrationUpdate
):
    reg = await db.workerregistration.find_unique(where={"id": reg_id})
    if not reg:
        raise NotFoundError("Worker registration not found")
    assert_org_admin(user, reg.organizationId)

    data: dict = {}
    if dto.status is not None:
        data["status"] = dto.status
    if dto.reviewedBy is not None:
        data["reviewedBy"] = dto.reviewedBy
    if dto.reviewedAt is not None:
        data["reviewedAt"] = parse_dt(dto.reviewedAt)

    return await db.workerregistration.update(where={"id": reg_id}, data=data)


async def approve(
    user: AuthenticatedUser, reg_id: str, dto: ApproveWorkerRegistration
):
    reg = await db.workerregistration.find_unique(where={"id": reg_id})
    if not reg:
        raise NotFoundError("Worker registration not found")
    assert_org_admin(user, reg.organizationId)
    if reg.status != "pending":
        raise ConflictError("Registration is not in pending status")

    async with db.tx() as tx:
        await tx.workerregistration.update(
            where={"id": reg_id},
            data={
                "status": "approved",
                "reviewedBy": user.id,
                "reviewedAt": datetime.now(timezone.utc),
            },
        )

        field_worker_data: dict = {
            "id": dto.userId,
            "organizationId": reg.organizationId,
            "specialization": reg.specialization,
            "status": dto.status or FieldWorkerStatus.active,
        }
        if dto.hireDate:
            field_worker_data["hireDate"] = parse_dt(dto.hireDate)
        if dto.salaryPerDay is not None:
            field_worker_data["salaryPerDay"] = dto.salaryPerDay
        if dto.bankAccount is not None:
            field_worker_data["bankAccount"] = dto.bankAccount
        if dto.bankName is not None:
            field_worker_data["bankName"] = dto.bankName

        field_worker = await tx.fieldworker.create(data=field_worker_data)

        return {
            "registration": {"id": reg.id, "status": "approved"},
            "fieldWorker": field_worker,
        }


async def remove(user: AuthenticatedUser, reg_id: str):
    reg = await db.workerregistration.find_unique(where={"id": reg_id})
    if not reg:
        raise NotFoundError("Worker registration not found")
    assert_org_admin(user, reg.organizationId)
    await db.workerregistration.delete(where={"id": reg_id})
    return {"message": "Worker registration deleted"}
