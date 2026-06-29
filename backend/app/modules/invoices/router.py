"""Invoices routes — port of invoices.controller.ts (@Controller('invoices'))."""
from __future__ import annotations

from typing import Optional

from uuid import UUID

from fastapi import APIRouter, Query

from app.core.deps import AuthenticatedUser, CurrentUser
from app.modules.invoices import service
from app.modules.invoices.schemas import InvoiceCreate, InvoiceUpdate

router = APIRouter(prefix="/invoices", tags=["invoices"])


# Registered BEFORE "/{id}" so the literal path isn't shadowed by the UUID route.
@router.get(
    "/public/{invoiceNumber}",
    summary="Public invoice lookup by invoice number (no auth required)",
)
async def find_public(invoiceNumber: str):
    return await service.find_public(invoiceNumber)


@router.get("", summary="List invoices scoped to the authenticated user")
async def find_all(
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.find_all(user, organizationId)


@router.get("/{id}", summary="Get a single invoice by ID")
async def find_one(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.find_one(user, str(id))


@router.post("", status_code=201, summary="Create a new invoice")
async def create(
    dto: InvoiceCreate,
    user: AuthenticatedUser = CurrentUser,
    organizationId: Optional[str] = Query(default=None),
):
    return await service.create(user, dto, organizationId or "")


@router.patch("/{id}", summary="Update an invoice")
async def update(id: UUID, dto: InvoiceUpdate, user: AuthenticatedUser = CurrentUser):
    return await service.update(user, str(id), dto)


@router.delete("/{id}", status_code=200, summary="Delete an invoice")
async def remove(id: UUID, user: AuthenticatedUser = CurrentUser):
    return await service.remove(user, str(id))
