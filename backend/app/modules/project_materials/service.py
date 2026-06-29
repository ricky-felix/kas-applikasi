"""Project-materials service — port of project-materials.service.ts.

Reproduces the org-scoped access rules: reads require org admin (super_admin
bypasses), writes require org admin. totalCost is computed as
quantityPlanned * unitPrice using Decimal math, mirroring the TS Decimal use.
"""
from __future__ import annotations

from decimal import Decimal

from app.core.database import db
from app.core.deps import AuthenticatedUser
from app.core.exceptions import NotFoundError
from app.core.org_scope import assert_org_admin, is_super_admin
from app.core.utils import parse_dt
from app.modules.project_materials.schemas import (
    ProjectMaterialCreate,
    ProjectMaterialUpdate,
)


async def find_by_project(user: AuthenticatedUser, project_id: str):
    project = await _get_project(project_id)
    if not is_super_admin(user):
        assert_org_admin(user, project.organizationId)
    return await db.projectmaterial.find_many(
        where={"projectId": project_id},
        include={"material": True},
    )


async def create(user: AuthenticatedUser, dto: ProjectMaterialCreate):
    project = await _get_project(dto.projectId)
    assert_org_admin(user, project.organizationId)
    total_cost = Decimal(str(dto.quantityPlanned)) * Decimal(str(dto.unitPrice))
    data = {
        "projectId": dto.projectId,
        "materialId": dto.materialId,
        "quantityPlanned": Decimal(str(dto.quantityPlanned)),
        "quantityUsed": Decimal(str(dto.quantityUsed if dto.quantityUsed is not None else 0)),
        "unitPrice": Decimal(str(dto.unitPrice)),
        "totalCost": total_cost,
    }
    if dto.deliveryDate:
        data["deliveryDate"] = parse_dt(dto.deliveryDate)
    return await db.projectmaterial.create(
        data=data,
        include={"material": True},
    )


async def update(user: AuthenticatedUser, pm_id: str, dto: ProjectMaterialUpdate):
    pm = await db.projectmaterial.find_unique(where={"id": pm_id})
    if not pm:
        raise NotFoundError("Project material not found")
    project = await _get_project(pm.projectId)
    assert_org_admin(user, project.organizationId)

    quantity_planned = (
        dto.quantityPlanned
        if dto.quantityPlanned is not None
        else float(pm.quantityPlanned)
    )
    unit_price = dto.unitPrice if dto.unitPrice is not None else float(pm.unitPrice)
    total_cost = Decimal(str(quantity_planned)) * Decimal(str(unit_price))

    data = dto.model_dump(exclude_unset=True)
    if "quantityPlanned" in data:
        data["quantityPlanned"] = Decimal(str(data["quantityPlanned"]))
    if "quantityUsed" in data:
        data["quantityUsed"] = Decimal(str(data["quantityUsed"]))
    if "unitPrice" in data:
        data["unitPrice"] = Decimal(str(data["unitPrice"]))
    data["totalCost"] = total_cost
    if dto.deliveryDate:
        data["deliveryDate"] = parse_dt(dto.deliveryDate)
    else:
        data.pop("deliveryDate", None)

    return await db.projectmaterial.update(
        where={"id": pm_id},
        data=data,
        include={"material": True},
    )


async def remove(user: AuthenticatedUser, pm_id: str):
    pm = await db.projectmaterial.find_unique(where={"id": pm_id})
    if not pm:
        raise NotFoundError("Project material not found")
    project = await _get_project(pm.projectId)
    assert_org_admin(user, project.organizationId)
    await db.projectmaterial.delete(where={"id": pm_id})
    return {"message": "Project material removed"}


async def _get_project(project_id: str):
    project = await db.project.find_unique(where={"id": project_id})
    if not project:
        raise NotFoundError("Project not found")
    return project
