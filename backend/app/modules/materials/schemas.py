"""Pydantic request schemas for materials (ports dto/create-material.dto.ts).

`extra="forbid"` reproduces NestJS's ValidationPipe forbidNonWhitelisted, and
Pydantic coercion reproduces transform/whitelist.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict

from prisma.enums import MaterialStatus


class MaterialCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    description: Optional[str] = None
    sku: Optional[str] = None
    unit: str
    unitPrice: float
    quantityOnHand: Optional[float] = None
    reorderLevel: Optional[float] = None
    status: Optional[MaterialStatus] = None
    supplierName: Optional[str] = None
    supplierPhone: Optional[str] = None


class MaterialUpdate(BaseModel):
    """PartialType(CreateMaterialDto) — every field optional."""

    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = None
    description: Optional[str] = None
    sku: Optional[str] = None
    unit: Optional[str] = None
    unitPrice: Optional[float] = None
    quantityOnHand: Optional[float] = None
    reorderLevel: Optional[float] = None
    status: Optional[MaterialStatus] = None
    supplierName: Optional[str] = None
    supplierPhone: Optional[str] = None
