"""Pydantic request schemas for field reports.

Ports dto/create-field-report.dto.ts, dto/create-attachment.dto.ts and
dto/update-field-report.dto.ts. `extra="forbid"` reproduces NestJS's
ValidationPipe forbidNonWhitelisted.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from prisma.enums import FieldReportStatus


class CreateFieldReportDto(BaseModel):
    model_config = ConfigDict(extra="forbid")

    projectId: str
    reportDate: str
    status: Optional[FieldReportStatus] = None
    progressPercentage: Optional[float] = Field(default=None, ge=0, le=100)
    workDescription: Optional[str] = None
    weatherCondition: Optional[str] = None
    challenges: Optional[str] = None
    materialUsageNotes: Optional[str] = None
    safetyNotes: Optional[str] = None


class UpdateFieldReportDto(BaseModel):
    """PartialType(CreateFieldReportDto) — every field optional."""

    model_config = ConfigDict(extra="forbid")

    projectId: Optional[str] = None
    reportDate: Optional[str] = None
    status: Optional[FieldReportStatus] = None
    progressPercentage: Optional[float] = Field(default=None, ge=0, le=100)
    workDescription: Optional[str] = None
    weatherCondition: Optional[str] = None
    challenges: Optional[str] = None
    materialUsageNotes: Optional[str] = None
    safetyNotes: Optional[str] = None


class CreateAttachmentDto(BaseModel):
    model_config = ConfigDict(extra="forbid")

    fileUrl: str
    fileName: Optional[str] = None
    attachmentType: Optional[str] = None
