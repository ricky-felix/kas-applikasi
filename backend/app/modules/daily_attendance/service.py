"""Daily-attendance service — port of daily-attendance.service.ts.

Reproduces the org-scoped access rules:
- super_admin sees everything (optionally filtered by projectId);
- org owner/admin can see a specific project's attendance (with org-admin check);
- everyone else sees only their own attendance records.
"""
from __future__ import annotations

from typing import Optional

from app.core.database import db
from app.core.deps import AuthenticatedUser
from app.core.exceptions import NotFoundError
from app.core.org_scope import assert_org_admin, is_super_admin
from app.core.utils import parse_dt
from app.modules.daily_attendance.schemas import (
    DailyAttendanceCreate,
    DailyAttendanceUpdate,
)


async def find_all(user: AuthenticatedUser, projectId: Optional[str]):
    if is_super_admin(user):
        return await db.dailyattendance.find_many(
            where={"projectId": projectId} if projectId else None,
        )

    is_admin = any(o.role in ("owner", "admin") for o in user.organizations)
    if is_admin and projectId:
        project = await db.project.find_unique(where={"id": projectId})
        if not project:
            raise NotFoundError("Project not found")
        assert_org_admin(user, project.organizationId)
        return await db.dailyattendance.find_many(where={"projectId": projectId})

    where: dict = {"workerId": user.id}
    if projectId:
        where["projectId"] = projectId
    return await db.dailyattendance.find_many(where=where)


async def find_one(user: AuthenticatedUser, attendance_id: str):
    record = await db.dailyattendance.find_unique(where={"id": attendance_id})
    if not record:
        raise NotFoundError("Attendance record not found")
    await _assert_can_read(user, record)
    return record


async def create(user: AuthenticatedUser, dto: DailyAttendanceCreate):
    project = await db.project.find_unique(where={"id": dto.projectId})
    if not project:
        raise NotFoundError("Project not found")

    worker_id = user.id
    if dto.workerId and dto.workerId != user.id:
        assert_org_admin(user, project.organizationId)
        worker_id = dto.workerId

    data: dict = {
        "projectId": dto.projectId,
        "workerId": worker_id,
        "attendanceDate": parse_dt(dto.attendanceDate),
        "status": dto.status if dto.status is not None else "present",
    }
    if dto.checkInTime is not None:
        data["checkInTime"] = dto.checkInTime
    if dto.checkOutTime is not None:
        data["checkOutTime"] = dto.checkOutTime
    if dto.hoursWorked is not None:
        data["hoursWorked"] = dto.hoursWorked
    if dto.notes is not None:
        data["notes"] = dto.notes

    return await db.dailyattendance.create(data=data)


async def update(user: AuthenticatedUser, attendance_id: str, dto: DailyAttendanceUpdate):
    record = await db.dailyattendance.find_unique(where={"id": attendance_id})
    if not record:
        raise NotFoundError("Attendance record not found")

    if not is_super_admin(user) and record.workerId != user.id:
        project = await db.project.find_unique(where={"id": record.projectId})
        if project:
            assert_org_admin(user, project.organizationId)

    data: dict = {}
    if dto.status is not None:
        data["status"] = dto.status
    if dto.checkInTime is not None:
        data["checkInTime"] = dto.checkInTime
    if dto.checkOutTime is not None:
        data["checkOutTime"] = dto.checkOutTime
    if dto.hoursWorked is not None:
        data["hoursWorked"] = dto.hoursWorked
    if dto.notes is not None:
        data["notes"] = dto.notes
    if dto.attendanceDate is not None:
        data["attendanceDate"] = parse_dt(dto.attendanceDate)

    return await db.dailyattendance.update(where={"id": attendance_id}, data=data)


async def remove(user: AuthenticatedUser, attendance_id: str):
    record = await db.dailyattendance.find_unique(where={"id": attendance_id})
    if not record:
        raise NotFoundError("Attendance record not found")
    project = await db.project.find_unique(where={"id": record.projectId})
    if project:
        assert_org_admin(user, project.organizationId)
    await db.dailyattendance.delete(where={"id": attendance_id})
    return {"message": "Attendance record deleted"}


async def _assert_can_read(user: AuthenticatedUser, record) -> None:
    if is_super_admin(user):
        return
    if record.workerId == user.id:
        return
    project = await db.project.find_unique(where={"id": record.projectId})
    if project:
        assert_org_admin(user, project.organizationId)
