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
exports.FieldWorkersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const org_scope_helper_1 = require("../common/helpers/org-scope.helper");
const USER_PROFILE_SELECT = { select: { id: true, name: true, email: true, phone: true } };
let FieldWorkersService = class FieldWorkersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(user, orgId) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user)) {
            return this.prisma.fieldWorker.findMany({
                where: orgId ? { organizationId: orgId } : undefined,
                include: { user: USER_PROFILE_SELECT },
            });
        }
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, resolvedOrgId);
        return this.prisma.fieldWorker.findMany({
            where: { organizationId: resolvedOrgId },
            include: { user: USER_PROFILE_SELECT },
        });
    }
    async findOne(user, id) {
        const fw = await this.prisma.fieldWorker.findUnique({
            where: { id },
            include: { user: USER_PROFILE_SELECT },
        });
        if (!fw)
            throw new common_1.NotFoundException('Field worker not found');
        if (!(0, org_scope_helper_1.isSuperAdmin)(user) && user.id !== id) {
            (0, org_scope_helper_1.assertOrgAdmin)(user, fw.organizationId);
        }
        return fw;
    }
    async create(user, dto, orgId) {
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, resolvedOrgId);
        return this.prisma.fieldWorker.create({
            data: {
                id: dto.id,
                organizationId: resolvedOrgId,
                specialization: dto.specialization,
                status: dto.status,
                hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
                salaryPerDay: dto.salaryPerDay,
                bankAccount: dto.bankAccount,
                bankName: dto.bankName,
            },
            include: { user: USER_PROFILE_SELECT },
        });
    }
    async update(user, id, dto) {
        const fw = await this.prisma.fieldWorker.findUnique({ where: { id } });
        if (!fw)
            throw new common_1.NotFoundException('Field worker not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, fw.organizationId);
        return this.prisma.fieldWorker.update({
            where: { id },
            data: {
                ...dto,
                hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
            },
            include: { user: USER_PROFILE_SELECT },
        });
    }
    async remove(user, id) {
        const fw = await this.prisma.fieldWorker.findUnique({ where: { id } });
        if (!fw)
            throw new common_1.NotFoundException('Field worker not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, fw.organizationId);
        await this.prisma.fieldWorker.delete({ where: { id } });
        return { message: 'Field worker deleted' };
    }
};
exports.FieldWorkersService = FieldWorkersService;
exports.FieldWorkersService = FieldWorkersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FieldWorkersService);
//# sourceMappingURL=field-workers.service.js.map