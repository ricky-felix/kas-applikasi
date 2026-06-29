"""Pydantic request schemas for projects (ports dto/create-project.dto.ts).

`extra="forbid"` reproduces NestJS's ValidationPipe forbidNonWhitelisted, and
Pydantic coercion reproduces transform/whitelist.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from prisma.enums import ProjectStatus


class ProjectCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    description: Optional[str] = None
    clientName: str
    clientEmail: Optional[EmailStr] = None
    clientPhone: Optional[str] = None
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[ProjectStatus] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    plannedBudget: Optional[float] = None
    actualBudget: Optional[float] = None
    projectManagerId: Optional[str] = None


class ProjectUpdate(BaseModel):
    """PartialType(CreateProjectDto) — every field optional."""

    model_config = ConfigDict(extra="forbid")

    title: Optional[str] = None
    description: Optional[str] = None
    clientName: Optional[str] = None
    clientEmail: Optional[EmailStr] = None
    clientPhone: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[ProjectStatus] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    plannedBudget: Optional[float] = None
    actualBudget: Optional[float] = None
    projectManagerId: Optional[str] = None
