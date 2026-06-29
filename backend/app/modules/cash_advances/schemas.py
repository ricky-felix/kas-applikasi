"""Pydantic request schemas for cash advances.

Ports dto/create-cash-advance.dto.ts and dto/update-cash-advance.dto.ts.
`extra="forbid"` reproduces NestJS's ValidationPipe forbidNonWhitelisted.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict

from prisma.enums import CashAdvanceStatus


class CashAdvanceCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    workerId: Optional[str] = None  # IsOptional + IsUUID
    amount: float  # IsNumber
    reason: str  # IsString
    advanceDate: str  # IsDateString
    status: Optional[CashAdvanceStatus] = None  # IsOptional + IsEnum


class CashAdvanceUpdate(BaseModel):
    """PartialType(CreateCashAdvanceDto) + status & approvedBy — every field optional."""

    model_config = ConfigDict(extra="forbid")

    workerId: Optional[str] = None
    amount: Optional[float] = None
    reason: Optional[str] = None
    advanceDate: Optional[str] = None
    status: Optional[CashAdvanceStatus] = None
    approvedBy: Optional[str] = None
