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
exports.CashAdvancesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const org_scope_helper_1 = require("../common/helpers/org-scope.helper");
let CashAdvancesService = class CashAdvancesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(user, orgId) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user)) {
            return this.prisma.cashAdvance.findMany({
                where: orgId ? { organizationId: orgId } : undefined,
                include: { worker: { select: { id: true, name: true } } },
                orderBy: { createdAt: 'desc' },
            });
        }
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        const membership = user.organizations.find(o => o.organizationId === resolvedOrgId);
        const where = membership && ['owner', 'admin'].includes(membership.role)
            ? { organizationId: resolvedOrgId }
            : { organizationId: resolvedOrgId, workerId: user.id };
        return this.prisma.cashAdvance.findMany({
            where,
            include: { worker: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(user, id) {
        const ca = await this.prisma.cashAdvance.findUnique({
            where: { id },
            include: { worker: { select: { id: true, name: true, email: true } }, approver: { select: { id: true, name: true } } },
        });
        if (!ca)
            throw new common_1.NotFoundException('Cash advance not found');
        if (!(0, org_scope_helper_1.isSuperAdmin)(user) && user.id !== ca.workerId)
            (0, org_scope_helper_1.assertOrgAdmin)(user, ca.organizationId);
        return ca;
    }
    async create(user, dto, orgId) {
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        return this.prisma.cashAdvance.create({
            data: {
                organizationId: resolvedOrgId,
                workerId: dto.workerId ?? user.id,
                amount: dto.amount,
                reason: dto.reason,
                status: dto.status ?? 'pending',
                advanceDate: new Date(dto.advanceDate),
            },
            include: { worker: { select: { id: true, name: true } } },
        });
    }
    async update(user, id, dto) {
        const ca = await this.prisma.cashAdvance.findUnique({ where: { id } });
        if (!ca)
            throw new common_1.NotFoundException('Cash advance not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, ca.organizationId);
        return this.prisma.cashAdvance.update({
            where: { id },
            data: {
                amount: dto.amount,
                reason: dto.reason,
                status: dto.status,
                advanceDate: dto.advanceDate ? new Date(dto.advanceDate) : undefined,
                approvedBy: dto.approvedBy,
            },
            include: { worker: { select: { id: true, name: true } } },
        });
    }
    async remove(user, id) {
        const ca = await this.prisma.cashAdvance.findUnique({ where: { id } });
        if (!ca)
            throw new common_1.NotFoundException('Cash advance not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, ca.organizationId);
        await this.prisma.cashAdvance.delete({ where: { id } });
        return { message: 'Cash advance deleted' };
    }
};
exports.CashAdvancesService = CashAdvancesService;
exports.CashAdvancesService = CashAdvancesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CashAdvancesService);
//# sourceMappingURL=cash-advances.service.js.map