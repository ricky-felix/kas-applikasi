"""Pydantic request schemas for proof submissions.

Ports dto/create-proof-submission.dto.ts and dto/update-proof-submission.dto.ts.
`extra="forbid"` reproduces NestJS's ValidationPipe forbidNonWhitelisted.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict

from prisma.enums import ProofStatus


class ProofSubmissionCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    invoiceId: str  # @IsUUID()
    fileUrl: str  # @IsString()
    amount: float  # @IsNumber()
    notes: Optional[str] = None  # @IsOptional() @IsString()


class ProofSubmissionUpdate(BaseModel):
    """PartialType-style update DTO — every field optional.

    Drives the review/approval flow: setting `status` (pending/approved/rejected)
    together with `reviewedBy`/`reviewedAt` records the review decision.
    """

    model_config = ConfigDict(extra="forbid")

    status: Optional[ProofStatus] = None  # @IsEnum(ProofStatus)
    reviewedBy: Optional[str] = None  # @IsUUID()
    reviewedAt: Optional[str] = None  # @IsDateString()
    notes: Optional[str] = None  # @IsString()
