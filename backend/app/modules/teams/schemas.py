"""Pydantic request schemas for teams.

Ports dto/create-team.dto.ts, dto/update-team.dto.ts, dto/add-team-member.dto.ts.
`extra="forbid"` reproduces NestJS's ValidationPipe forbidNonWhitelisted.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict


class TeamCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    description: Optional[str] = None
    teamLeadId: Optional[str] = None


class TeamUpdate(BaseModel):
    """PartialType(CreateTeamDto) — every field optional."""

    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = None
    description: Optional[str] = None
    teamLeadId: Optional[str] = None


class AddTeamMember(BaseModel):
    model_config = ConfigDict(extra="forbid")

    workerId: str
    role: Optional[str] = None
