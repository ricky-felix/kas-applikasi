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
exports.MaterialRequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const org_scope_helper_1 = require("../common/helpers/org-scope.helper");
let MaterialRequestsService = class MaterialRequestsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(user, orgId) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user)) {
            return this.prisma.materialRequest.findMany({
                where: orgId ? { organizationId: orgId } : undefined,
                include: { project: { select: { id: true, title: true } }, material: { select: { id: true, name: true } }, requester: { select: { id: true, name: true } } },
                orderBy: { createdAt: 'desc' },
            });
        }
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        const membership = user.organizations.find(o => o.organizationId === resolvedOrgId);
        const where = membership && ['owner', 'admin'].includes(membership.role)
            ? { organizationId: resolvedOrgId }
            : { organizationId: resolvedOrgId, requestedBy: user.id };
        return this.prisma.materialRequest.findMany({
            where,
            include: { project: { select: { id: true, title: true } }, material: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(user, id) {
        const mr = await this.prisma.materialRequest.findUnique({
            where: { id },
            include: { project: true, material: true, requester: { select: { id: true, name: true, email: true } } },
        });
        if (!mr)
            throw new common_1.NotFoundException('Material request not found');
        if (!(0, org_scope_helper_1.isSuperAdmin)(user) && user.id !== mr.requestedBy)
            (0, org_scope_helper_1.assertOrgAdmin)(user, mr.organizationId);
        return mr;
    }
    async create(user, dto, orgId) {
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return this.prisma.materialRequest.create({
            data: {
                organizationId: resolvedOrgId,
                projectId: dto.projectId,
                materialId: dto.materialId,
                materialName: dto.materialName,
                quantity: dto.quantity,
                unit: dto.unit,
                status: dto.status ?? 'pending',
                requestedBy: user.id,
                notes: dto.notes,
            },
            include: { project: { select: { id: true, title: true } } },
        });
    }
    async update(user, id, dto) {
        const mr = await this.prisma.materialRequest.findUnique({ where: { id } });
        if (!mr)
            throw new common_1.NotFoundException('Material request not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, mr.organizationId);
        return this.prisma.materialRequest.update({
            where: { id },
            data: {
                materialName: dto.materialName,
                quantity: dto.quantity,
                unit: dto.unit,
                status: dto.status,
                reviewedBy: dto.reviewedBy,
                notes: dto.notes,
            },
            include: { project: { select: { id: true, title: true } } },
        });
    }
    async remove(user, id) {
        const mr = await this.prisma.materialRequest.findUnique({ where: { id } });
        if (!mr)
            throw new common_1.NotFoundException('Material request not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, mr.organizationId);
        await this.prisma.materialRequest.delete({ where: { id } });
        return { message: 'Material request deleted' };
    }
};
exports.MaterialRequestsService = MaterialRequestsService;
exports.MaterialRequestsService = MaterialRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaterialRequestsService);
//# sourceMappingURL=material-requests.service.js.map