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
exports.WorkerRegistrationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const org_scope_helper_1 = require("../common/helpers/org-scope.helper");
let WorkerRegistrationsService = class WorkerRegistrationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(user, orgId) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user)) {
            return this.prisma.workerRegistration.findMany({
                where: orgId ? { organizationId: orgId } : undefined,
                orderBy: { createdAt: 'desc' },
            });
        }
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, resolvedOrgId);
        return this.prisma.workerRegistration.findMany({
            where: { organizationId: resolvedOrgId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(user, id) {
        const reg = await this.prisma.workerRegistration.findUnique({
            where: { id },
            include: { reviewer: { select: { id: true, name: true } } },
        });
        if (!reg)
            throw new common_1.NotFoundException('Worker registration not found');
        if (!(0, org_scope_helper_1.isSuperAdmin)(user))
            (0, org_scope_helper_1.assertOrgAdmin)(user, reg.organizationId);
        return reg;
    }
    async create(user, dto, orgId) {
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        return this.prisma.workerRegistration.create({
            data: {
                organizationId: resolvedOrgId,
                fullName: dto.fullName,
                phone: dto.phone,
                specialization: dto.specialization,
            },
        });
    }
    async update(user, id, dto) {
        const reg = await this.prisma.workerRegistration.findUnique({ where: { id } });
        if (!reg)
            throw new common_1.NotFoundException('Worker registration not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, reg.organizationId);
        return this.prisma.workerRegistration.update({
            where: { id },
            data: {
                status: dto.status,
                reviewedBy: dto.reviewedBy,
                reviewedAt: dto.reviewedAt ? new Date(dto.reviewedAt) : undefined,
            },
        });
    }
    async approve(user, id, dto) {
        const reg = await this.prisma.workerRegistration.findUnique({ where: { id } });
        if (!reg)
            throw new common_1.NotFoundException('Worker registration not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, reg.organizationId);
        if (reg.status !== 'pending')
            throw new common_1.ConflictException('Registration is not in pending status');
        return this.prisma.$transaction(async (tx) => {
            await tx.workerRegistration.update({
                where: { id },
                data: {
                    status: 'approved',
                    reviewedBy: user.id,
                    reviewedAt: new Date(),
                },
            });
            const fieldWorker = await tx.fieldWorker.create({
                data: {
                    id: dto.userId,
                    organizationId: reg.organizationId,
                    specialization: reg.specialization,
                    status: dto.status ?? 'active',
                    hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
                    salaryPerDay: dto.salaryPerDay,
                    bankAccount: dto.bankAccount,
                    bankName: dto.bankName,
                },
            });
            return { registration: { id: reg.id, status: 'approved' }, fieldWorker };
        });
    }
    async remove(user, id) {
        const reg = await this.prisma.workerRegistration.findUnique({ where: { id } });
        if (!reg)
            throw new common_1.NotFoundException('Worker registration not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, reg.organizationId);
        await this.prisma.workerRegistration.delete({ where: { id } });
        return { message: 'Worker registration deleted' };
    }
};
exports.WorkerRegistrationsService = WorkerRegistrationsService;
exports.WorkerRegistrationsService = WorkerRegistrationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkerRegistrationsService);
//# sourceMappingURL=worker-registrations.service.js.map