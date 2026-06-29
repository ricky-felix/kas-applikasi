"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const org_scope_helper_1 = require("../common/helpers/org-scope.helper");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    resolveOrg(user, orgId) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user))
            return orgId;
        const resolved = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, resolved);
        return resolved;
    }
    async getDashboard(user, orgId) {
        const resolvedOrgId = this.resolveOrg(user, orgId);
        const orgFilter = resolvedOrgId ? { organizationId: resolvedOrgId } : {};
        const [projectsByStatus, budgetAgg, activeProjects, latestReports, activeAssignments, invoiceOutstanding,] = await Promise.all([
            this.prisma.project.groupBy({
                by: ['status'],
                where: orgFilter,
                _count: { id: true },
            }),
            this.prisma.project.aggregate({
                where: orgFilter,
                _sum: { plannedBudget: true, actualBudget: true },
            }),
            this.prisma.project.count({ where: { ...orgFilter, status: 'in_progress' } }),
            this.prisma.fieldReport.findMany({
                where: {
                    ...(resolvedOrgId ? { project: { organizationId: resolvedOrgId } } : {}),
                    status: { not: 'draft' },
                },
                orderBy: { reportDate: 'desc' },
                select: { projectId: true, progressPercentage: true },
                distinct: ['projectId'],
            }),
            this.prisma.projectTeamAssignment.count({
                where: {
                    project: { ...orgFilter, status: 'in_progress' },
                    actualEndDate: null,
                },
            }),
            this.prisma.invoice.aggregate({
                where: { ...orgFilter, status: { in: ['sent', 'partially_paid', 'overdue'] } },
                _sum: { totalAmount: true, paidAmount: true },
            }),
        ]);
        const progressValues = latestReports
            .map((r) => Number(r.progressPercentage ?? 0))
            .filter((v) => v > 0);
        const avgProgress = progressValues.length > 0
            ? progressValues.reduce((a, b) => a + b, 0) / progressValues.length
            : 0;
        const outstandingTotal = Number(invoiceOutstanding._sum.totalAmount ?? 0) -
            Number(invoiceOutstanding._sum.paidAmount ?? 0);
        return {
            projectsByStatus: projectsByStatus.map((g) => ({ status: g.status, count: g._count.id })),
            totalPlannedBudget: budgetAgg._sum.plannedBudget ?? 0,
            totalActualBudget: budgetAgg._sum.actualBudget ?? 0,
            activeProjectCount: activeProjects,
            avgProgressPercentage: Math.round(avgProgress * 100) / 100,
            workersOnSiteCount: activeAssignments,
            outstandingInvoiceTotal: outstandingTotal,
        };
    }
    async getFinance(user, orgId) {
        const resolvedOrgId = this.resolveOrg(user, orgId);
        const orgFilter = resolvedOrgId ? { organizationId: resolvedOrgId } : {};
        const [monthlyCashFlows, invoicePaid, invoiceOutstanding, expenseByCategory] = await Promise.all([
            this.prisma.$queryRawUnsafe(`
          SELECT
            TO_CHAR(transaction_date, 'YYYY-MM') AS month,
            type,
            SUM(amount)::float AS total
          FROM cash_flows
          ${resolvedOrgId ? `WHERE organization_id = '${resolvedOrgId}'` : ''}
          GROUP BY month, type
          ORDER BY month DESC
          LIMIT 120
        `),
            this.prisma.invoice.aggregate({
                where: { ...orgFilter, status: 'paid' },
                _sum: { totalAmount: true },
                _count: { id: true },
            }),
            this.prisma.invoice.aggregate({
                where: { ...orgFilter, status: { in: ['sent', 'partially_paid', 'overdue'] } },
                _sum: { totalAmount: true, paidAmount: true },
                _count: { id: true },
            }),
            this.prisma.cashFlow.groupBy({
                by: ['category'],
                where: { ...orgFilter, type: 'expense' },
                _sum: { amount: true },
                orderBy: { _sum: { amount: 'desc' } },
                take: 10,
            }),
        ]);
        return {
            monthlyCashFlows,
            invoices: {
                paid: {
                    count: invoicePaid._count.id,
                    total: invoicePaid._sum.totalAmount ?? 0,
                },
                outstanding: {
                    count: invoiceOutstanding._count.id,
                    totalBilled: invoiceOutstanding._sum.totalAmount ?? 0,
                    totalPaid: invoiceOutstanding._sum.paidAmount ?? 0,
                    totalOwed: Number(invoiceOutstanding._sum.totalAmount ?? 0) -
                        Number(invoiceOutstanding._sum.paidAmount ?? 0),
                },
            },
            topExpenseCategories: expenseByCategory.map((c) => ({
                category: c.category,
                total: c._sum.amount ?? 0,
            })),
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map