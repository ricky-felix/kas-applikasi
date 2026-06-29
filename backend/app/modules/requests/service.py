"""Requests service — port of requests.service.ts.

Reproduces the same org-scoped rules: super_admin sees everything (optionally
filtered by org), otherwise the caller must be an org owner/admin. Both creating
and reviewing/approving a request require owner/admin role (assert_org_admin).

The status transition (review/approval) lives in `update`: whenever the request
status changes, `reviewedBy`/`reviewedAt` are stamped with the acting user and
the current time, mirroring the original service exactly.
"""
from __future__ import annotations

from typing import Optional

from datetime import datetime, timezone

from app.core.database import db
from app.core.deps import AuthenticatedUser
from app.core.exceptions import NotFoundError
from app.core.org_scope import assert_org_admin, is_super_admin, resolve_org_id
from app.core.utils import clean, parse_dt
from app.modules.requests.schemas import RequestCreate, RequestUpdate


async def find_all(user: AuthenticatedUser, org_id: Optional[str]):
    if is_super_admin(user):
        return await db.request.find_many(
            where={"organizationId": org_id} if org_id else None,
        )

    resolved = resolve_org_id(user, org_id)
    assert_org_admin(user, resolved)
    return await db.request.find_many(where={"organizationId": resolved})


async def find_one(user: AuthenticatedUser, request_id: str):
    request = await db.request.find_unique(where={"id": request_id})
    if not request:
        raise NotFoundError("Request not found")
    if not is_super_admin(user):
        assert_org_admin(user, request.organizationId)
    return request


async def create(user: AuthenticatedUser, dto: RequestCreate, org_id: str):
    resolved = resolve_org_id(user, org_id or None)
    assert_org_admin(user, resolved)
    data = clean(dto.model_dump(exclude_unset=True))
    data["organizationId"] = resolved
    data["createdBy"] = user.id
    if dto.quoteValidUntil:
        data["quoteValidUntil"] = parse_dt(dto.quoteValidUntil)
    return await db.request.create(data=clean(data))


async def update(user: AuthenticatedUser, request_id: str, dto: RequestUpdate):
    request = await db.request.find_unique(where={"id": request_id})
    if not request:
        raise NotFoundError("Request not found")
    assert_org_admin(user, request.organizationId)

    data = clean(dto.model_dump(exclude_unset=True))
    if dto.quoteValidUntil:
        data["quoteValidUntil"] = parse_dt(dto.quoteValidUntil)

    # Status transition (review/approval): stamp reviewer + timestamp only when
    # the status actually changes.
    if dto.status is not None and dto.status != request.status:
        data["reviewedBy"] = user.id
        data["reviewedAt"] = datetime.now(timezone.utc)

    return await db.request.update(where={"id": request_id}, data=clean(data))


async def remove(user: AuthenticatedUser, request_id: str):
    request = await db.request.find_unique(where={"id": request_id})
    if not request:
        raise NotFoundError("Request not found")
    assert_org_admin(user, request.organizationId)
    await db.request.delete(where={"id": request_id})
    return {"message": "Request deleted"}
