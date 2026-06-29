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
exports.ChangeOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const org_scope_helper_1 = require("../common/helpers/org-scope.helper");
let ChangeOrdersService = class ChangeOrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(user, orgId) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user)) {
            return this.prisma.changeOrder.findMany({
                where: orgId ? { organizationId: orgId } : undefined,
                include: { project: { select: { id: true, title: true } }, requester: { select: { id: true, name: true } } },
                orderBy: { createdAt: 'desc' },
            });
        }
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, resolvedOrgId);
        return this.prisma.changeOrder.findMany({
            where: { organizationId: resolvedOrgId },
            include: { project: { select: { id: true, title: true } }, requester: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(user, id) {
        const co = await this.prisma.changeOrder.findUnique({
            where: { id },
            include: { project: true, requester: { select: { id: true, name: true, email: true } }, reviewer: { select: { id: true, name: true } } },
        });
        if (!co)
            throw new common_1.NotFoundException('Change order not found');
        if (!(0, org_scope_helper_1.isSuperAdmin)(user))
            (0, org_scope_helper_1.assertOrgAdmin)(user, co.organizationId);
        return co;
    }
    async create(user, dto, orgId) {
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return this.prisma.changeOrder.create({
            data: {
                organizationId: resolvedOrgId,
                projectId: dto.projectId,
                title: dto.title,
                description: dto.description,
                amount: dto.amount,
                status: dto.status ?? 'pending',
                requestedBy: user.id,
            },
            include: { project: { select: { id: true, title: true } } },
        });
    }
    async update(user, id, dto) {
        const co = await this.prisma.changeOrder.findUnique({ where: { id } });
        if (!co)
            throw new common_1.NotFoundException('Change order not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, co.organizationId);
        return this.prisma.changeOrder.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                amount: dto.amount,
                status: dto.status,
                reviewedBy: dto.reviewedBy,
                reviewedAt: dto.reviewedAt ? new Date(dto.reviewedAt) : undefined,
            },
            include: { project: { select: { id: true, title: true } } },
        });
    }
    async remove(user, id) {
        const co = await this.prisma.changeOrder.findUnique({ where: { id } });
        if (!co)
            throw new common_1.NotFoundException('Change order not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, co.organizationId);
        await this.prisma.changeOrder.delete({ where: { id } });
        return { message: 'Change order deleted' };
    }
};
exports.ChangeOrdersService = ChangeOrdersService;
exports.ChangeOrdersService = ChangeOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChangeOrdersService);
//# sourceMappingURL=change-orders.service.js.map