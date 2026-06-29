"""Pydantic request schemas for project-materials.

Ports dto/create-project-material.dto.ts and dto/update-project-material.dto.ts.
`extra="forbid"` reproduces NestJS's ValidationPipe forbidNonWhitelisted.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProjectMaterialCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    projectId: str
    materialId: str
    quantityPlanned: float
    quantityUsed: Optional[float] = None
    unitPrice: float
    deliveryDate: Optional[str] = None


class ProjectMaterialUpdate(BaseModel):
    """PartialType(CreateProjectMaterialDto) — every field optional."""

    model_config = ConfigDict(extra="forbid")

    projectId: Optional[str] = None
    materialId: Optional[str] = None
    quantityPlanned: Optional[float] = None
    quantityUsed: Optional[float] = None
    unitPrice: Optional[float] = None
    deliveryDate: Optional[str] = None
