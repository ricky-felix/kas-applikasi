"""Cash-flows service — port of cash-flows.service.ts.

Org-scoped read/write rules: super_admin sees everything (filtered by optional
organizationId); org owner/admin manage their org's cash flows.
"""
from __future__ import annotations

from typing import Optional

from app.core.database import db
from app.core.deps import AuthenticatedUser
from app.core.exceptions import NotFoundError
from app.core.org_scope import assert_org_admin, is_super_admin, resolve_org_id
from app.core.utils import clean, parse_dt
from app.modules.cash_flows.schemas import CashFlowCreate, CashFlowUpdate


async def find_all(user: AuthenticatedUser, org_id: Optional[str]):
    if is_super_admin(user):
        return await db.cashflow.find_many(
            where={"organizationId": org_id} if org_id else None,
            order={"transactionDate": "desc"},
        )

    resolved = resolve_org_id(user, org_id)
    assert_org_admin(user, resolved)
    return await db.cashflow.find_many(
        where={"organizationId": resolved},
        order={"transactionDate": "desc"},
    )


async def find_one(user: AuthenticatedUser, cash_flow_id: str):
    cf = await db.cashflow.find_unique(where={"id": cash_flow_id})
    if not cf:
        raise NotFoundError("Cash flow not found")
    if not is_super_admin(user):
        assert_org_admin(user, cf.organizationId)
    return cf


async def create(user: AuthenticatedUser, dto: CashFlowCreate, org_id: str):
    resolved = resolve_org_id(user, org_id or None)
    assert_org_admin(user, resolved)
    data = clean(dto.model_dump(exclude_unset=True))
    data["organizationId"] = resolved
    data["createdBy"] = user.id
    data["transactionDate"] = parse_dt(dto.transactionDate)
    return await db.cashflow.create(data=clean(data))


async def update(user: AuthenticatedUser, cash_flow_id: str, dto: CashFlowUpdate):
    cf = await db.cashflow.find_unique(where={"id": cash_flow_id})
    if not cf:
        raise NotFoundError("Cash flow not found")
    assert_org_admin(user, cf.organizationId)
    data = clean(dto.model_dump(exclude_unset=True))
    if "transactionDate" in data:
        data["transactionDate"] = parse_dt(data["transactionDate"])
    return await db.cashflow.update(where={"id": cash_flow_id}, data=clean(data))


async def remove(user: AuthenticatedUser, cash_flow_id: str):
    cf = await db.cashflow.find_unique(where={"id": cash_flow_id})
    if not cf:
        raise NotFoundError("Cash flow not found")
    assert_org_admin(user, cf.organizationId)
    await db.cashflow.delete(where={"id": cash_flow_id})
    return {"message": "Cash flow deleted"}


async def get_summary(user: AuthenticatedUser, org_id: Optional[str]):
    resolved = org_id if is_super_admin(user) else resolve_org_id(user, org_id)
    if not is_super_admin(user):
        assert_org_admin(user, resolved)

    # Prisma Client Python has no `aggregate`; group_by reproduces the two
    # `_sum.amount` aggregates from the original service in a single query.
    grouped = await db.cashflow.group_by(
        by=["type"],
        where={"organizationId": resolved},
        sum={"amount": True},
    )

    def _sum_for(cf_type: str):
        for row in grouped:
            if row["type"] == cf_type:
                return (row.get("_sum") or {}).get("amount") or 0
        return 0

    total_income = _sum_for("income")
    total_expense = _sum_for("expense")
    return {
        "totalIncome": total_income,
        "totalExpense": total_expense,
        "netCashFlow": float(total_income) - float(total_expense),
    }
