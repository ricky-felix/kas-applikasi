"""Field reports service — port of field-reports.service.ts.

Reproduces the org-scoped access rules:
- super_admin bypasses all checks
- org owner/admin can read/manage reports of projects in their org
- workers (members) can create reports on projects they're assigned to, and
  read/update their own draft reports.
"""
from __future__ import annotations

from typing import Optional

from prisma.enums import FieldReportStatus

from app.core.database import db
from app.core.deps import AuthenticatedUser
from app.core.exceptions import ForbiddenError, NotFoundError
from app.core.org_scope import assert_org_admin, is_super_admin
from app.core.utils import clean, parse_dt
from app.modules.field_reports.schemas import (
    CreateAttachmentDto,
    CreateFieldReportDto,
    UpdateFieldReportDto,
)


async def find_all(user: AuthenticatedUser, project_id: Optional[str]):
    if is_super_admin(user):
        return await db.fieldreport.find_many(
            where={"projectId": project_id} if project_id else None,
            include={"attachments": True},
        )

    is_admin = any(o.role in ("owner", "admin") for o in user.organizations)
    if is_admin and project_id:
        project = await db.project.find_unique(where={"id": project_id})
        if not project:
            raise NotFoundError("Project not found")
        assert_org_admin(user, project.organizationId)
        return await db.fieldreport.find_many(
            where={"projectId": project_id},
            include={"attachments": True},
        )

    where: dict = {"reportedBy": user.id}
    if project_id:
        where["projectId"] = project_id
    return await db.fieldreport.find_many(
        where=where,
        include={"attachments": True},
    )


async def find_one(user: AuthenticatedUser, report_id: str):
    report = await db.fieldreport.find_unique(
        where={"id": report_id}, include={"attachments": True}
    )
    if not report:
        raise NotFoundError("Field report not found")
    await _assert_can_read(user, report)
    return report


async def create(user: AuthenticatedUser, dto: CreateFieldReportDto):
    project = await db.project.find_unique(where={"id": dto.projectId})
    if not project:
        raise NotFoundError("Project not found")

    if not is_super_admin(user):
        membership = next(
            (o for o in user.organizations if o.organizationId == project.organizationId),
            None,
        )
        if membership and membership.role in ("owner", "admin"):
            pass
        else:
            assignment = await db.projectteamassignment.find_first(
                where={"projectId": dto.projectId, "workerId": user.id},
            )
            if not assignment:
                raise ForbiddenError("Not assigned to this project")

    data = clean(dto.model_dump(exclude_unset=True))
    data["reportedBy"] = user.id
    data["reportDate"] = parse_dt(dto.reportDate)
    data["status"] = dto.status or FieldReportStatus.draft
    return await db.fieldreport.create(data=clean(data))


async def update(user: AuthenticatedUser, report_id: str, dto: UpdateFieldReportDto):
    report = await db.fieldreport.find_unique(where={"id": report_id})
    if not report:
        raise NotFoundError("Field report not found")

    if not is_super_admin(user):
        project = await db.project.find_unique(where={"id": report.projectId})
        if not project:
            raise NotFoundError()
        membership = next(
            (o for o in user.organizations if o.organizationId == project.organizationId),
            None,
        )
        if membership and membership.role in ("owner", "admin"):
            pass
        elif report.reportedBy == user.id:
            if report.status != FieldReportStatus.draft:
                raise ForbiddenError(
                    "Only draft reports can be updated by the reporter"
                )
        else:
            raise ForbiddenError("Access denied")

    data = clean(dto.model_dump(exclude_unset=True))
    if "reportDate" in data:
        data["reportDate"] = parse_dt(data["reportDate"])
    return await db.fieldreport.update(where={"id": report_id}, data=clean(data))


async def remove(user: AuthenticatedUser, report_id: str):
    report = await db.fieldreport.find_unique(where={"id": report_id})
    if not report:
        raise NotFoundError("Field report not found")
    project = await db.project.find_unique(where={"id": report.projectId})
    if not project:
        raise NotFoundError()
    assert_org_admin(user, project.organizationId)
    await db.fieldreport.delete(where={"id": report_id})
    return {"message": "Field report deleted"}


async def add_attachment(
    user: AuthenticatedUser, report_id: str, dto: CreateAttachmentDto
):
    report = await db.fieldreport.find_unique(where={"id": report_id})
    if not report:
        raise NotFoundError("Field report not found")

    if not is_super_admin(user) and report.reportedBy != user.id:
        project = await db.project.find_unique(where={"id": report.projectId})
        if project:
            assert_org_admin(user, project.organizationId)

    data = clean(dto.model_dump(exclude_unset=True))
    data["fieldReportId"] = report_id
    return await db.fieldreportattachment.create(data=clean(data))


async def remove_attachment(user: AuthenticatedUser, attachment_id: str):
    att = await db.fieldreportattachment.find_unique(where={"id": attachment_id})
    if not att:
        raise NotFoundError("Attachment not found")
    report = await db.fieldreport.find_unique(where={"id": att.fieldReportId})
    if not report:
        raise NotFoundError()

    if not is_super_admin(user) and report.reportedBy != user.id:
        project = await db.project.find_unique(where={"id": report.projectId})
        if project:
            assert_org_admin(user, project.organizationId)

    await db.fieldreportattachment.delete(where={"id": attachment_id})
    return {"message": "Attachment removed"}


async def _assert_can_read(user: AuthenticatedUser, report) -> None:
    if is_super_admin(user):
        return
    if report.reportedBy == user.id:
        return
    project = await db.project.find_unique(where={"id": report.projectId})
    if not project:
        return
    assert_org_admin(user, project.organizationId)
