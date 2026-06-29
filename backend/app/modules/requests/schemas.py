"""Pydantic request schemas for requests (ports dto/create-request.dto.ts).

`extra="forbid"` reproduces NestJS's ValidationPipe forbidNonWhitelisted, and
Pydantic coercion reproduces transform/whitelist.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from prisma.enums import RequestStatus


class RequestCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    clientName: str
    clientEmail: Optional[EmailStr] = None
    clientPhone: Optional[str] = None
    requestType: Optional[str] = None
    description: str
    location: Optional[str] = None
    status: Optional[RequestStatus] = None
    estimatedBudget: Optional[float] = None
    quotedAmount: Optional[float] = None
    quoteValidUntil: Optional[str] = None
    notes: Optional[str] = None


class RequestUpdate(BaseModel):
    """PartialType(CreateRequestDto) — every field optional."""

    model_config = ConfigDict(extra="forbid")

    clientName: Optional[str] = None
    clientEmail: Optional[EmailStr] = None
    clientPhone: Optional[str] = None
    requestType: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    status: Optional[RequestStatus] = None
    estimatedBudget: Optional[float] = None
    quotedAmount: Optional[float] = None
    quoteValidUntil: Optional[str] = None
    notes: Optional[str] = None
