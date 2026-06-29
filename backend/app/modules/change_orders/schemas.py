"""Pydantic request schemas for change orders.

Ports dto/create-change-order.dto.ts and dto/update-change-order.dto.ts.
`extra="forbid"` reproduces NestJS's ValidationPipe forbidNonWhitelisted.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict

from prisma.enums import ChangeOrderStatus


class ChangeOrderCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    projectId: str
    title: str
    description: Optional[str] = None
    amount: float
    status: Optional[ChangeOrderStatus] = None


class ChangeOrderUpdate(BaseModel):
    """PartialType(CreateChangeOrderDto) + reviewedBy/reviewedAt overrides."""

    model_config = ConfigDict(extra="forbid")

    projectId: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    status: Optional[ChangeOrderStatus] = None
    reviewedBy: Optional[str] = None
    reviewedAt: Optional[str] = None
