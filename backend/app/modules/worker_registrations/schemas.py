"""Pydantic request schemas for worker-registrations.

Ports dto/create-worker-registration.dto.ts, dto/update-worker-registration.dto.ts,
and dto/approve-worker-registration.dto.ts.

`extra="forbid"` reproduces NestJS's ValidationPipe forbidNonWhitelisted.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict

from prisma.enums import FieldWorkerStatus, RegistrationStatus


class WorkerRegistrationCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    fullName: str
    phone: str
    specialization: Optional[str] = None


class WorkerRegistrationUpdate(BaseModel):
    """UpdateWorkerRegistrationDto — all fields optional."""

    model_config = ConfigDict(extra="forbid")

    status: Optional[RegistrationStatus] = None
    reviewedBy: Optional[str] = None
    reviewedAt: Optional[str] = None


class ApproveWorkerRegistration(BaseModel):
    """ApproveWorkerRegistrationDto."""

    model_config = ConfigDict(extra="forbid")

    userId: str
    status: Optional[FieldWorkerStatus] = None
    hireDate: Optional[str] = None
    salaryPerDay: Optional[float] = None
    bankAccount: Optional[str] = None
    bankName: Optional[str] = None
