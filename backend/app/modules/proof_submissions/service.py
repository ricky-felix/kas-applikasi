"""Proof submissions service — port of proof-submissions.service.ts.

Reproduces the payment-proof review/approval flow:
  - super_admin sees all (optionally org-filtered); org owner/admin see their org's.
  - create() validates the linked invoice exists; submissions start as `pending`
    (DB default).
  - update() is the review transition — an org admin records status
    (approved/rejected/pending) plus reviewer + reviewedAt.
"""
from __future__ import annotations

from typing import Optional

from app.core.database import db
from app.core.deps import AuthenticatedUser
from app.core.exceptions import NotFoundError
from app.core.org_scope import assert_org_admin, is_super_admin, resolve_org_id
from app.core.utils import clean, parse_dt
from app.modules.proof_submissions.schemas import (
    ProofSubmissionCreate,
    ProofSubmissionUpdate,
)


async def find_all(user: AuthenticatedUser, org_id: Optional[str]):
    if is_super_admin(user):
        return await db.proofsubmission.find_many(
            where={"organizationId": org_id} if org_id else None,
            include={"invoice": {"select": {"id": True, "invoiceNumber": True}}},
            order={"submittedAt": "desc"},
        )

    resolved = resolve_org_id(user, org_id)
    assert_org_admin(user, resolved)
    return await db.proofsubmission.find_many(
        where={"organizationId": resolved},
        include={"invoice": {"select": {"id": True, "invoiceNumber": True}}},
        order={"submittedAt": "desc"},
    )


async def find_one(user: AuthenticatedUser, ps_id: str):
    ps = await db.proofsubmission.find_unique(
        where={"id": ps_id},
        include={
            "invoice": True,
            "reviewer": {"select": {"id": True, "name": True}},
        },
    )
    if not ps:
        raise NotFoundError("Proof submission not found")
    if not is_super_admin(user):
        assert_org_admin(user, ps.organizationId)
    return ps


async def create(user: AuthenticatedUser, dto: ProofSubmissionCreate, org_id: str):
    resolved = resolve_org_id(user, org_id or None)
    invoice = await db.invoice.find_unique(where={"id": dto.invoiceId})
    if not invoice:
        raise NotFoundError("Invoice not found")
    data = {
        "organizationId": resolved,
        "invoiceId": dto.invoiceId,
        "fileUrl": dto.fileUrl,
        "amount": dto.amount,
        "notes": dto.notes,
    }
    return await db.proofsubmission.create(data=clean(data))


async def update(user: AuthenticatedUser, ps_id: str, dto: ProofSubmissionUpdate):
    ps = await db.proofsubmission.find_unique(where={"id": ps_id})
    if not ps:
        raise NotFoundError("Proof submission not found")
    assert_org_admin(user, ps.organizationId)
    data = {
        "status": dto.status,
        "reviewedBy": dto.reviewedBy,
        "reviewedAt": parse_dt(dto.reviewedAt) if dto.reviewedAt else None,
        "notes": dto.notes,
    }
    return await db.proofsubmission.update(where={"id": ps_id}, data=clean(data))


async def remove(user: AuthenticatedUser, ps_id: str):
    ps = await db.proofsubmission.find_unique(where={"id": ps_id})
    if not ps:
        raise NotFoundError("Proof submission not found")
    assert_org_admin(user, ps.organizationId)
    await db.proofsubmission.delete(where={"id": ps_id})
    return {"message": "Proof submission deleted"}
