"""Materials service — port of materials.service.ts.

Org-scoped read/write rules: super_admin sees everything; otherwise the org is
resolved from the request and owner/admin access is enforced.
"""
from __future__ import annotations

from typing import Optional

from app.core.database import db
from app.core.deps import AuthenticatedUser
from app.core.exceptions import NotFoundError
from app.core.org_scope import assert_org_admin, is_super_admin, resolve_org_id
from app.core.utils import clean
from app.modules.materials.schemas import MaterialCreate, MaterialUpdate


async def find_all(user: AuthenticatedUser, org_id: Optional[str]):
    if is_super_admin(user):
        return await db.material.find_many(
            where={"organizationId": org_id} if org_id else None,
        )

    resolved = resolve_org_id(user, org_id)
    assert_org_admin(user, resolved)
    return await db.material.find_many(where={"organizationId": resolved})


async def find_one(user: AuthenticatedUser, material_id: str):
    material = await db.material.find_unique(where={"id": material_id})
    if not material:
        raise NotFoundError("Material not found")
    if not is_super_admin(user):
        assert_org_admin(user, material.organizationId)
    return material


async def create(user: AuthenticatedUser, dto: MaterialCreate, org_id: str):
    resolved = resolve_org_id(user, org_id or None)
    assert_org_admin(user, resolved)
    data = clean(dto.model_dump(exclude_unset=True))
    data["organizationId"] = resolved
    return await db.material.create(data=data)


async def update(user: AuthenticatedUser, material_id: str, dto: MaterialUpdate):
    material = await db.material.find_unique(where={"id": material_id})
    if not material:
        raise NotFoundError("Material not found")
    assert_org_admin(user, material.organizationId)
    data = clean(dto.model_dump(exclude_unset=True))
    return await db.material.update(where={"id": material_id}, data=data)


async def remove(user: AuthenticatedUser, material_id: str):
    material = await db.material.find_unique(where={"id": material_id})
    if not material:
        raise NotFoundError("Material not found")
    assert_org_admin(user, material.organizationId)
    await db.material.delete(where={"id": material_id})
    return {"message": "Material deleted"}
