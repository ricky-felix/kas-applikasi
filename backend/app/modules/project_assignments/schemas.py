"""Pydantic request schemas for project assignments.

Ports dto/create-project-assignment.dto.ts and dto/update-project-assignment.dto.ts.
`extra="forbid"` reproduces NestJS's ValidationPipe forbidNonWhitelisted.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProjectAssignmentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    projectId: str
    teamId: Optional[str] = None
    workerId: Optional[str] = None
    role: Optional[str] = None
    assignedDate: str
    expectedEndDate: Optional[str] = None
    actualEndDate: Optional[str] = None


class ProjectAssignmentUpdate(BaseModel):
    """PartialType(CreateProjectAssignmentDto) — every field optional."""

    model_config = ConfigDict(extra="forbid")

    projectId: Optional[str] = None
    teamId: Optional[str] = None
    workerId: Optional[str] = None
    role: Optional[str] = None
    assignedDate: Optional[str] = None
    expectedEndDate: Optional[str] = None
    actualEndDate: Optional[str] = None
