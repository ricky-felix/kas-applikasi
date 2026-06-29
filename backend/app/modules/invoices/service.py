"""Invoices service — port of invoices.service.ts.

Reproduces org-scoped read rules and the nested line-item creation/recalculation
logic. Money fields are Prisma Decimal; we compute with Python Decimal and pass
Decimal values (Prisma Client Python accepts them).
"""
from __future__ import annotations

from decimal import Decimal

from app.core.database import db
from app.core.deps import AuthenticatedUser
from app.core.exceptions import NotFoundError
from app.core.org_scope import assert_org_admin, is_super_admin, resolve_org_id
from app.core.utils import parse_dt
from app.modules.invoices.schemas import InvoiceCreate, InvoiceUpdate


def _dec(value) -> Decimal:
    return Decimal(str(value))


async def find_all(user: AuthenticatedUser, org_id):
    if is_super_admin(user):
        return await db.invoice.find_many(
            where={"organizationId": org_id} if org_id else None,
            include={"lineItems": True},
        )

    resolved = resolve_org_id(user, org_id)
    assert_org_admin(user, resolved)
    return await db.invoice.find_many(
        where={"organizationId": resolved},
        include={"lineItems": True},
    )


async def find_one(user: AuthenticatedUser, id: str):
    invoice = await db.invoice.find_unique(
        where={"id": id}, include={"lineItems": True}
    )
    if not invoice:
        raise NotFoundError("Invoice not found")
    if not is_super_admin(user):
        assert_org_admin(user, invoice.organizationId)
    return invoice


async def create(user: AuthenticatedUser, dto: InvoiceCreate, org_id: str):
    resolved = resolve_org_id(user, org_id or None)
    assert_org_admin(user, resolved)

    line_items_with_totals = []
    for li in dto.lineItems:
        line_total = _dec(li.quantity) * _dec(li.unitPrice)
        line_items_with_totals.append(
            {
                "description": li.description,
                "quantity": li.quantity,
                "unitPrice": li.unitPrice,
                "lineTotal": line_total,
            }
        )

    subtotal = sum((li["lineTotal"] for li in line_items_with_totals), Decimal(0))
    tax_amount = _dec(dto.taxAmount if dto.taxAmount is not None else 0)
    discount_amount = _dec(
        dto.discountAmount if dto.discountAmount is not None else 0
    )
    total_amount = subtotal + tax_amount - discount_amount

    data = {
        "organizationId": resolved,
        "projectId": dto.projectId,
        "requestId": dto.requestId,
        "invoiceNumber": dto.invoiceNumber,
        "clientName": dto.clientName,
        "clientEmail": dto.clientEmail,
        "clientPhone": dto.clientPhone,
        "invoiceDate": parse_dt(dto.invoiceDate),
        "dueDate": parse_dt(dto.dueDate),
        "subtotal": subtotal,
        "taxAmount": tax_amount,
        "discountAmount": discount_amount,
        "totalAmount": total_amount,
        "paidAmount": dto.paidAmount if dto.paidAmount is not None else 0,
        "status": dto.status,
        "paymentMethod": dto.paymentMethod,
        "notes": dto.notes,
        "createdBy": user.id,
        "lineItems": {
            "create": [
                {
                    "description": li["description"],
                    "quantity": li["quantity"],
                    "unitPrice": li["unitPrice"],
                    "lineTotal": li["lineTotal"],
                }
                for li in line_items_with_totals
            ]
        },
    }
    return await db.invoice.create(data=data, include={"lineItems": True})


async def update(user: AuthenticatedUser, id: str, dto: InvoiceUpdate):
    invoice = await db.invoice.find_unique(where={"id": id})
    if not invoice:
        raise NotFoundError("Invoice not found")
    assert_org_admin(user, invoice.organizationId)

    update_data = {
        "clientName": dto.clientName,
        "clientEmail": dto.clientEmail,
        "clientPhone": dto.clientPhone,
        "invoiceDate": parse_dt(dto.invoiceDate) if dto.invoiceDate else None,
        "dueDate": parse_dt(dto.dueDate) if dto.dueDate else None,
        "paidAmount": dto.paidAmount,
        "status": dto.status,
        "paymentMethod": dto.paymentMethod,
        "notes": dto.notes,
    }

    if dto.lineItems and len(dto.lineItems) > 0:
        line_items_with_totals = []
        for li in dto.lineItems:
            line_total = _dec(li.quantity) * _dec(li.unitPrice)
            line_items_with_totals.append(
                {
                    "description": li.description,
                    "quantity": li.quantity,
                    "unitPrice": li.unitPrice,
                    "lineTotal": line_total,
                }
            )

        subtotal = sum(
            (li["lineTotal"] for li in line_items_with_totals), Decimal(0)
        )
        tax_amount = _dec(
            dto.taxAmount if dto.taxAmount is not None else invoice.taxAmount
        )
        discount_amount = _dec(
            dto.discountAmount
            if dto.discountAmount is not None
            else invoice.discountAmount
        )
        total_amount = subtotal + tax_amount - discount_amount

        update_data["subtotal"] = subtotal
        update_data["taxAmount"] = tax_amount
        update_data["discountAmount"] = discount_amount
        update_data["totalAmount"] = total_amount
        update_data["lineItems"] = {
            "deleteMany": {},
            "create": [
                {
                    "description": li["description"],
                    "quantity": li["quantity"],
                    "unitPrice": li["unitPrice"],
                    "lineTotal": li["lineTotal"],
                }
                for li in line_items_with_totals
            ],
        }

    # Drop undefined-equivalent keys (None) to mirror Prisma ignoring `undefined`,
    # while preserving the nested lineItems write object.
    data = {k: v for k, v in update_data.items() if v is not None}
    return await db.invoice.update(
        where={"id": id}, data=data, include={"lineItems": True}
    )


async def remove(user: AuthenticatedUser, id: str):
    invoice = await db.invoice.find_unique(where={"id": id})
    if not invoice:
        raise NotFoundError("Invoice not found")
    assert_org_admin(user, invoice.organizationId)
    await db.invoice.delete(where={"id": id})
    return {"message": "Invoice deleted"}


async def find_public(invoice_number: str):
    invoice = await db.invoice.find_unique(
        where={"invoiceNumber": invoice_number},
        include={"lineItems": True},
    )
    if not invoice:
        raise NotFoundError("Invoice not found")
    return {
        "invoiceNumber": invoice.invoiceNumber,
        "clientName": invoice.clientName,
        "clientEmail": invoice.clientEmail,
        "invoiceDate": invoice.invoiceDate,
        "dueDate": invoice.dueDate,
        "subtotal": invoice.subtotal,
        "taxAmount": invoice.taxAmount,
        "discountAmount": invoice.discountAmount,
        "totalAmount": invoice.totalAmount,
        "paidAmount": invoice.paidAmount,
        "status": invoice.status,
        "notes": invoice.notes,
        "lineItems": [
            {
                "description": li.description,
                "quantity": li.quantity,
                "unitPrice": li.unitPrice,
                "lineTotal": li.lineTotal,
            }
            for li in (invoice.lineItems or [])
        ],
    }
