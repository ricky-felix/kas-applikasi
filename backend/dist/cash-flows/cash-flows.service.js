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
exports.CashFlowsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const org_scope_helper_1 = require("../common/helpers/org-scope.helper");
let CashFlowsService = class CashFlowsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(user, orgId) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user)) {
            return this.prisma.cashFlow.findMany({ where: orgId ? { organizationId: orgId } : undefined, orderBy: { transactionDate: 'desc' } });
        }
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, resolvedOrgId);
        return this.prisma.cashFlow.findMany({ where: { organizationId: resolvedOrgId }, orderBy: { transactionDate: 'desc' } });
    }
    async findOne(user, id) {
        const cf = await this.prisma.cashFlow.findUnique({ where: { id } });
        if (!cf)
            throw new common_1.NotFoundException('Cash flow not found');
        if (!(0, org_scope_helper_1.isSuperAdmin)(user))
            (0, org_scope_helper_1.assertOrgAdmin)(user, cf.organizationId);
        return cf;
    }
    async create(user, dto, orgId) {
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, resolvedOrgId);
        return this.prisma.cashFlow.create({
            data: {
                ...dto,
                organizationId: resolvedOrgId,
                createdBy: user.id,
                transactionDate: new Date(dto.transactionDate),
            },
        });
    }
    async update(user, id, dto) {
        const cf = await this.prisma.cashFlow.findUnique({ where: { id } });
        if (!cf)
            throw new common_1.NotFoundException('Cash flow not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, cf.organizationId);
        return this.prisma.cashFlow.update({
            where: { id },
            data: {
                ...dto,
                transactionDate: dto.transactionDate ? new Date(dto.transactionDate) : undefined,
            },
        });
    }
    async remove(user, id) {
        const cf = await this.prisma.cashFlow.findUnique({ where: { id } });
        if (!cf)
            throw new common_1.NotFoundException('Cash flow not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, cf.organizationId);
        await this.prisma.cashFlow.delete({ where: { id } });
        return { message: 'Cash flow deleted' };
    }
    async getSummary(user, orgId) {
        const resolvedOrgId = (0, org_scope_helper_1.isSuperAdmin)(user) ? orgId : (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        if (!(0, org_scope_helper_1.isSuperAdmin)(user))
            (0, org_scope_helper_1.assertOrgAdmin)(user, resolvedOrgId);
        const [income, expense] = await Promise.all([
            this.prisma.cashFlow.aggregate({
                where: { organizationId: resolvedOrgId, type: 'income' },
                _sum: { amount: true },
            }),
            this.prisma.cashFlow.aggregate({
                where: { organizationId: resolvedOrgId, type: 'expense' },
                _sum: { amount: true },
            }),
        ]);
        const totalIncome = income._sum.amount ?? 0;
        const totalExpense = expense._sum.amount ?? 0;
        return {
            totalIncome,
            totalExpense,
            netCashFlow: Number(totalIncome) - Number(totalExpense),
        };
    }
};
exports.CashFlowsService = CashFlowsService;
exports.CashFlowsService = CashFlowsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CashFlowsService);
//# sourceMappingURL=cash-flows.service.js.map