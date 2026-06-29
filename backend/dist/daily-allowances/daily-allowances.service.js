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
exports.DailyAllowancesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const org_scope_helper_1 = require("../common/helpers/org-scope.helper");
let DailyAllowancesService = class DailyAllowancesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(user, orgId) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user)) {
            return this.prisma.dailyAllowance.findMany({
                where: orgId ? { organizationId: orgId } : undefined,
                include: { worker: { select: { id: true, name: true } }, project: { select: { id: true, title: true } } },
                orderBy: { allowanceDate: 'desc' },
            });
        }
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        const membership = user.organizations.find(o => o.organizationId === resolvedOrgId);
        const where = membership && ['owner', 'admin'].includes(membership.role)
            ? { organizationId: resolvedOrgId }
            : { organizationId: resolvedOrgId, workerId: user.id };
        return this.prisma.dailyAllowance.findMany({
            where,
            include: { project: { select: { id: true, title: true } } },
            orderBy: { allowanceDate: 'desc' },
        });
    }
    async findOne(user, id) {
        const da = await this.prisma.dailyAllowance.findUnique({
            where: { id },
            include: { worker: { select: { id: true, name: true, email: true } }, project: { select: { id: true, title: true } } },
        });
        if (!da)
            throw new common_1.NotFoundException('Daily allowance not found');
        if (!(0, org_scope_helper_1.isSuperAdmin)(user) && user.id !== da.workerId)
            (0, org_scope_helper_1.assertOrgAdmin)(user, da.organizationId);
        return da;
    }
    async create(user, dto, orgId) {
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, resolvedOrgId);
        return this.prisma.dailyAllowance.create({
            data: {
                organizationId: resolvedOrgId,
                workerId: dto.workerId ?? user.id,
                projectId: dto.projectId,
                allowanceType: dto.allowanceType,
                amount: dto.amount,
                allowanceDate: new Date(dto.allowanceDate),
                notes: dto.notes,
            },
            include: { worker: { select: { id: true, name: true } } },
        });
    }
    async update(user, id, dto) {
        const da = await this.prisma.dailyAllowance.findUnique({ where: { id } });
        if (!da)
            throw new common_1.NotFoundException('Daily allowance not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, da.organizationId);
        return this.prisma.dailyAllowance.update({
            where: { id },
            data: {
                allowanceType: dto.allowanceType,
                amount: dto.amount,
                allowanceDate: dto.allowanceDate ? new Date(dto.allowanceDate) : undefined,
                notes: dto.notes,
            },
        });
    }
    async remove(user, id) {
        const da = await this.prisma.dailyAllowance.findUnique({ where: { id } });
        if (!da)
            throw new common_1.NotFoundException('Daily allowance not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, da.organizationId);
        await this.prisma.dailyAllowance.delete({ where: { id } });
        return { message: 'Daily allowance deleted' };
    }
};
exports.DailyAllowancesService = DailyAllowancesService;
exports.DailyAllowancesService = DailyAllowancesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DailyAllowancesService);
//# sourceMappingURL=daily-allowances.service.js.map