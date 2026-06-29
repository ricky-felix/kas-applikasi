"""Pydantic request schemas for material-requests.

Ports dto/create-material-request.dto.ts and dto/update-material-request.dto.ts.
`extra="forbid"` reproduces NestJS's ValidationPipe forbidNonWhitelisted.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict

from prisma.enums import MaterialRequestStatus


class MaterialRequestCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    projectId: str
    materialId: Optional[str] = None
    materialName: str
    quantity: float
    unit: str
    status: Optional[MaterialRequestStatus] = None
    notes: Optional[str] = None


class MaterialRequestUpdate(BaseModel):
    """PartialType(CreateMaterialRequestDto) + status/reviewedBy overrides."""

    model_config = ConfigDict(extra="forbid")

    projectId: Optional[str] = None
    materialId: Optional[str] = None
    materialName: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    status: Optional[MaterialRequestStatus] = None
    notes: Optional[str] = None
    reviewedBy: Optional[str] = None
