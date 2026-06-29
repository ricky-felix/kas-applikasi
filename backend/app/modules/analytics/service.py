"""Analytics service — port of analytics.service.ts.

Reproduces the portfolio dashboard and finance-summary aggregations with the
exact same numbers, keys, and org-scoping rules as the original NestJS service.

Note on aggregations: the Prisma Python client in this build does NOT expose
`aggregate` on the model actions, so every `prisma.<model>.aggregate({ _sum,
_count })` call in the TS source is reproduced here via `group_by(...)` and a
Python-side reduction over the returned groups (same result as a global
aggregate). The `topExpenseCategories` block was already a `groupBy` in the
original and is translated directly. The monthly cash-flow report used
`$queryRawUnsafe` and is reproduced with `db.query_raw` using a parameterised
query (the only behavioural improvement: parameterisation instead of string
interpolation; the resulting rows are identical).
"""
from __future__ import annotations

from typing import Optional

from prisma.enums import CashFlowType, InvoiceStatus, ProjectStatus

from app.core.database import db
from app.core.deps import AuthenticatedUser
from app.core.org_scope import assert_org_admin, is_super_admin, resolve_org_id


def _resolve_org(user: AuthenticatedUser, org_id: Optional[str]) -> Optional[str]:
    """Port of private resolveOrg(): super_admin keeps the raw orgId (may be
    None → portfolio-wide), everyone else is resolved + must be owner/admin."""
    if is_super_admin(user):
        return org_id
    resolved = resolve_org_id(user, org_id)
    assert_org_admin(user, resolved)
    return resolved


def _agg(item, group: str, field: str) -> float:
    """Pull a numeric aggregate (e.g. _sum.amount) out of a group_by row,
    coercing Decimal/None to float (mirrors Number(x ?? 0) in the TS)."""
    bucket = item.get(group) if isinstance(item, dict) else getattr(item, group, None)
    if bucket is None:
        return 0.0
    value = bucket.get(field) if isinstance(bucket, dict) else getattr(bucket, field, None)
    return float(value) if value is not None else 0.0


def _count_id(item) -> int:
    bucket = item.get("_count") if isinstance(item, dict) else getattr(item, "_count", None)
    if bucket is None:
        return 0
    value = bucket.get("id") if isinstance(bucket, dict) else getattr(bucket, "id", None)
    return int(value) if value is not None else 0


def _field(item, name):
    return item.get(name) if isinstance(item, dict) else getattr(item, name, None)


async def get_dashboard(user: AuthenticatedUser, org_id: Optional[str]):
    resolved_org_id = _resolve_org(user, org_id)
    org_filter = {"organizationId": resolved_org_id} if resolved_org_id else {}

    # projectsByStatus: project.groupBy({ by: ['status'], _count: { id } })
    projects_by_status = await db.project.group_by(
        by=["status"],
        where=org_filter or None,
        count={"id": True},
    )

    # budgetAgg: project.aggregate({ _sum: { plannedBudget, actualBudget } })
    # -> group_by + Python reduction (no global `aggregate` in this build).
    budget_groups = await db.project.group_by(
        by=["organizationId"],
        where=org_filter or None,
        sum={"plannedBudget": True, "actualBudget": True},
    )
    total_planned_budget = sum(_agg(g, "_sum", "plannedBudget") for g in budget_groups)
    total_actual_budget = sum(_agg(g, "_sum", "actualBudget") for g in budget_groups)

    # activeProjects: project.count({ where: { ...org, status: 'in_progress' } })
    active_projects = await db.project.count(
        where={**org_filter, "status": ProjectStatus.in_progress},
    )

    # latestReports: fieldReport.findMany distinct projectId, status != draft.
    latest_reports = await db.fieldreport.find_many(
        where={
            **(
                {"project": {"organizationId": resolved_org_id}}
                if resolved_org_id
                else {}
            ),
            "status": {"not": "draft"},
        },
        order={"reportDate": "desc"},
        distinct=["projectId"],
    )

    # activeAssignments: projectTeamAssignment.count(in_progress project, actualEndDate null)
    active_assignments = await db.projectteamassignment.count(
        where={
            "project": {**org_filter, "status": ProjectStatus.in_progress},
            "actualEndDate": None,
        },
    )

    # invoiceOutstanding: invoice.aggregate({ _sum: { totalAmount, paidAmount } })
    # filtered to sent / partially_paid / overdue.
    outstanding_status = {
        "in": [
            InvoiceStatus.sent,
            InvoiceStatus.partially_paid,
            InvoiceStatus.overdue,
        ]
    }
    invoice_outstanding_groups = await db.invoice.group_by(
        by=["organizationId"],
        where={**org_filter, "status": outstanding_status},
        sum={"totalAmount": True, "paidAmount": True},
    )
    outstanding_total_amount = sum(
        _agg(g, "_sum", "totalAmount") for g in invoice_outstanding_groups
    )
    outstanding_paid_amount = sum(
        _agg(g, "_sum", "paidAmount") for g in invoice_outstanding_groups
    )

    # progress: Number(r.progressPercentage ?? 0) filtered to > 0, averaged.
    progress_values = [
        v
        for v in (
            float(_field(r, "progressPercentage") or 0) for r in latest_reports
        )
        if v > 0
    ]
    avg_progress = (
        sum(progress_values) / len(progress_values) if progress_values else 0.0
    )

    outstanding_total = outstanding_total_amount - outstanding_paid_amount

    return {
        "projectsByStatus": [
            {"status": _field(g, "status"), "count": _count_id(g)}
            for g in projects_by_status
        ],
        "totalPlannedBudget": total_planned_budget,
        "totalActualBudget": total_actual_budget,
        "activeProjectCount": active_projects,
        "avgProgressPercentage": round(avg_progress * 100) / 100,
        "workersOnSiteCount": active_assignments,
        "outstandingInvoiceTotal": outstanding_total,
    }


async def get_finance(user: AuthenticatedUser, org_id: Optional[str]):
    resolved_org_id = _resolve_org(user, org_id)
    org_filter = {"organizationId": resolved_org_id} if resolved_org_id else {}

    # monthlyCashFlows: raw SQL grouped by month + type, newest first, capped 120.
    if resolved_org_id:
        monthly_cash_flows = await db.query_raw(
            """
          SELECT
            TO_CHAR(transaction_date, 'YYYY-MM') AS month,
            type,
            SUM(amount)::float AS total
          FROM cash_flows
          WHERE organization_id = $1
          GROUP BY month, type
          ORDER BY month DESC
          LIMIT 120
        """,
            resolved_org_id,
        )
    else:
        monthly_cash_flows = await db.query_raw(
            """
          SELECT
            TO_CHAR(transaction_date, 'YYYY-MM') AS month,
            type,
            SUM(amount)::float AS total
          FROM cash_flows
          GROUP BY month, type
          ORDER BY month DESC
          LIMIT 120
        """
        )

    # invoicePaid: invoice.aggregate({ _sum: { totalAmount }, _count: { id } }, status: paid)
    invoice_paid_groups = await db.invoice.group_by(
        by=["organizationId"],
        where={**org_filter, "status": InvoiceStatus.paid},
        sum={"totalAmount": True},
        count={"id": True},
    )
    invoice_paid_count = sum(_count_id(g) for g in invoice_paid_groups)
    invoice_paid_total = sum(_agg(g, "_sum", "totalAmount") for g in invoice_paid_groups)

    # invoiceOutstanding: invoice.aggregate({ _sum: { totalAmount, paidAmount }, _count: { id } })
    outstanding_status = {
        "in": [
            InvoiceStatus.sent,
            InvoiceStatus.partially_paid,
            InvoiceStatus.overdue,
        ]
    }
    invoice_out_groups = await db.invoice.group_by(
        by=["organizationId"],
        where={**org_filter, "status": outstanding_status},
        sum={"totalAmount": True, "paidAmount": True},
        count={"id": True},
    )
    invoice_out_count = sum(_count_id(g) for g in invoice_out_groups)
    invoice_out_total_billed = sum(
        _agg(g, "_sum", "totalAmount") for g in invoice_out_groups
    )
    invoice_out_total_paid = sum(
        _agg(g, "_sum", "paidAmount") for g in invoice_out_groups
    )

    # expenseByCategory: cashFlow.groupBy({ by: ['category'], _sum: { amount },
    # orderBy: { _sum: { amount: 'desc' } }, take: 10 }), type expense.
    expense_by_category = await db.cashflow.group_by(
        by=["category"],
        where={**org_filter, "type": CashFlowType.expense},
        sum={"amount": True},
        order={"_sum": {"amount": "desc"}},
        take=10,
    )

    return {
        "monthlyCashFlows": monthly_cash_flows,
        "invoices": {
            "paid": {
                "count": invoice_paid_count,
                "total": invoice_paid_total,
            },
            "outstanding": {
                "count": invoice_out_count,
                "totalBilled": invoice_out_total_billed,
                "totalPaid": invoice_out_total_paid,
                "totalOwed": invoice_out_total_billed - invoice_out_total_paid,
            },
        },
        "topExpenseCategories": [
            {"category": _field(c, "category"), "total": _agg(c, "_sum", "amount")}
            for c in expense_by_category
        ],
    }
