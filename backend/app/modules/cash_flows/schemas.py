"""Pydantic request schemas for cash-flows (ports dto/create-cash-flow.dto.ts).

`extra="forbid"` reproduces NestJS's ValidationPipe forbidNonWhitelisted.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict

from prisma.enums import CashFlowCategory, CashFlowType


class CashFlowCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: CashFlowType
    category: CashFlowCategory
    amount: float
    description: Optional[str] = None
    referenceType: Optional[str] = None
    referenceId: Optional[str] = None
    transactionDate: str
    notes: Optional[str] = None


class CashFlowUpdate(BaseModel):
    """PartialType(CreateCashFlowDto) — every field optional."""

    model_config = ConfigDict(extra="forbid")

    type: Optional[CashFlowType] = None
    category: Optional[CashFlowCategory] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    referenceType: Optional[str] = None
    referenceId: Optional[str] = None
    transactionDate: Optional[str] = None
    notes: Optional[str] = None
