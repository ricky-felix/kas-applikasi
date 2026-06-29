"""Pydantic request schemas for invoices (ports dto/*.dto.ts).

`extra="forbid"` reproduces NestJS's ValidationPipe forbidNonWhitelisted.
"""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from prisma.enums import InvoiceStatus


class CreateInvoiceLineItem(BaseModel):
    """Ports create-invoice-line-item.dto.ts."""

    model_config = ConfigDict(extra="forbid")

    description: str
    quantity: float
    unitPrice: float


class InvoiceCreate(BaseModel):
    """Ports create-invoice.dto.ts."""

    model_config = ConfigDict(extra="forbid")

    projectId: Optional[str] = None
    requestId: Optional[str] = None
    invoiceNumber: str
    clientName: str
    clientEmail: Optional[EmailStr] = None
    clientPhone: Optional[str] = None
    invoiceDate: str
    dueDate: str
    taxAmount: Optional[float] = None
    discountAmount: Optional[float] = None
    paidAmount: Optional[float] = None
    status: Optional[InvoiceStatus] = None
    paymentMethod: Optional[str] = None
    notes: Optional[str] = None
    lineItems: List[CreateInvoiceLineItem]


class InvoiceUpdate(BaseModel):
    """PartialType(CreateInvoiceDto) — every field optional."""

    model_config = ConfigDict(extra="forbid")

    projectId: Optional[str] = None
    requestId: Optional[str] = None
    invoiceNumber: Optional[str] = None
    clientName: Optional[str] = None
    clientEmail: Optional[EmailStr] = None
    clientPhone: Optional[str] = None
    invoiceDate: Optional[str] = None
    dueDate: Optional[str] = None
    taxAmount: Optional[float] = None
    discountAmount: Optional[float] = None
    paidAmount: Optional[float] = None
    status: Optional[InvoiceStatus] = None
    paymentMethod: Optional[str] = None
    notes: Optional[str] = None
    lineItems: Optional[List[CreateInvoiceLineItem]] = None
