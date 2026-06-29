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
exports.ProjectMaterialsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const org_scope_helper_1 = require("../common/helpers/org-scope.helper");
const library_1 = require("@prisma/client/runtime/library");
let ProjectMaterialsService = class ProjectMaterialsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByProject(user, projectId) {
        const project = await this.getProject(projectId);
        if (!(0, org_scope_helper_1.isSuperAdmin)(user))
            (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
        return this.prisma.projectMaterial.findMany({
            where: { projectId },
            include: { material: true },
        });
    }
    async create(user, dto) {
        const project = await this.getProject(dto.projectId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
        const totalCost = new library_1.Decimal(dto.quantityPlanned).mul(new library_1.Decimal(dto.unitPrice));
        return this.prisma.projectMaterial.create({
            data: {
                projectId: dto.projectId,
                materialId: dto.materialId,
                quantityPlanned: dto.quantityPlanned,
                quantityUsed: dto.quantityUsed ?? 0,
                unitPrice: dto.unitPrice,
                totalCost,
                deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
            },
            include: { material: true },
        });
    }
    async update(user, id, dto) {
        const pm = await this.prisma.projectMaterial.findUnique({ where: { id } });
        if (!pm)
            throw new common_1.NotFoundException('Project material not found');
        const project = await this.getProject(pm.projectId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
        const quantityPlanned = dto.quantityPlanned ?? Number(pm.quantityPlanned);
        const unitPrice = dto.unitPrice ?? Number(pm.unitPrice);
        const totalCost = new library_1.Decimal(quantityPlanned).mul(new library_1.Decimal(unitPrice));
        return this.prisma.projectMaterial.update({
            where: { id },
            data: {
                ...dto,
                totalCost,
                deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
            },
            include: { material: true },
        });
    }
    async remove(user, id) {
        const pm = await this.prisma.projectMaterial.findUnique({ where: { id } });
        if (!pm)
            throw new common_1.NotFoundException('Project material not found');
        const project = await this.getProject(pm.projectId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
        await this.prisma.projectMaterial.delete({ where: { id } });
        return { message: 'Project material removed' };
    }
    async getProject(projectId) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return project;
    }
};
exports.ProjectMaterialsService = ProjectMaterialsService;
exports.ProjectMaterialsService = ProjectMaterialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectMaterialsService);
//# sourceMappingURL=project-materials.service.js.map