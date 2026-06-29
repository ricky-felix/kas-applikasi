"""Pydantic request schemas for daily allowances.

Ports dto/create-daily-allowance.dto.ts and dto/update-daily-allowance.dto.ts.
`extra="forbid"` reproduces NestJS's ValidationPipe forbidNonWhitelisted.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict


class DailyAllowanceCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    workerId: Optional[str] = None
    projectId: Optional[str] = None
    allowanceType: str
    amount: float
    allowanceDate: str
    notes: Optional[str] = None


class DailyAllowanceUpdate(BaseModel):
    """PartialType(CreateDailyAllowanceDto) — every field optional."""

    model_config = ConfigDict(extra="forbid")

    workerId: Optional[str] = None
    projectId: Optional[str] = None
    allowanceType: Optional[str] = None
    amount: Optional[float] = None
    allowanceDate: Optional[str] = None
    notes: Optional[str] = None
