"""Pydantic request schemas for field workers.

Ports dto/create-field-worker.dto.ts and dto/update-field-worker.dto.ts.
`extra="forbid"` reproduces NestJS's ValidationPipe forbidNonWhitelisted.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict

from prisma.enums import FieldWorkerStatus


class FieldWorkerCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str  # IsUUID — User ID, must exist in public.users
    specialization: Optional[str] = None
    status: Optional[FieldWorkerStatus] = None
    hireDate: Optional[str] = None  # IsDateString
    salaryPerDay: Optional[float] = None
    bankAccount: Optional[str] = None
    bankName: Optional[str] = None


class FieldWorkerUpdate(BaseModel):
    """PartialType(OmitType(CreateFieldWorkerDto, ['id'])) — no id, all optional."""

    model_config = ConfigDict(extra="forbid")

    specialization: Optional[str] = None
    status: Optional[FieldWorkerStatus] = None
    hireDate: Optional[str] = None
    salaryPerDay: Optional[float] = None
    bankAccount: Optional[str] = None
    bankName: Optional[str] = None
