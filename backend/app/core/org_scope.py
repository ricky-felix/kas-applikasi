"""Organization-scoping helpers.

Direct port of common/helpers/org-scope.helper.ts. Services call these to
enforce multi-tenant access rules (super_admin bypass, org membership, roles).
"""
from __future__ import annotations

from typing import Optional

from app.core.deps import AuthenticatedUser
from app.core.exceptions import ForbiddenError


def is_super_admin(user: AuthenticatedUser) -> bool:
    return user.globalRole == "super_admin"


def resolve_org_id(user: AuthenticatedUser, requested_org_id: Optional[str]) -> str:
    if user.globalRole == "super_admin":
        if not requested_org_id:
            raise ForbiddenError("super_admin must provide organizationId query param")
        return requested_org_id

    if requested_org_id:
        membership = next(
            (o for o in user.organizations if o.organizationId == requested_org_id), None
        )
    else:
        membership = user.organizations[0] if user.organizations else None

    if not membership:
        raise ForbiddenError("Not a member of this organization")
    return membership.organizationId


def assert_org_admin(user: AuthenticatedUser, organization_id: str) -> None:
    if user.globalRole == "super_admin":
        return
    membership = next(
        (o for o in user.organizations if o.organizationId == organization_id), None
    )
    if not membership:
        raise ForbiddenError("Not a member of this organization")
    if membership.role not in ("owner", "admin"):
        raise ForbiddenError("Requires owner or admin role")


def assert_org_owner(user: AuthenticatedUser, organization_id: str) -> None:
    if user.globalRole == "super_admin":
        return
    membership = next(
        (o for o in user.organizations if o.organizationId == organization_id), None
    )
    if not membership or membership.role != "owner":
        raise ForbiddenError("Requires owner role")


def get_org_role(user: AuthenticatedUser, organization_id: str) -> Optional[str]:
    if user.globalRole == "super_admin":
        return "super_admin"
    membership = next(
        (o for o in user.organizations if o.organizationId == organization_id), None
    )
    return membership.role if membership else None
