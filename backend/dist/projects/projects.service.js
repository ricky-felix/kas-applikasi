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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const org_scope_helper_1 = require("../common/helpers/org-scope.helper");
const client_1 = require("@prisma/client");
let ProjectsService = class ProjectsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(user, orgId) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user)) {
            return this.prisma.project.findMany({
                where: orgId ? { organizationId: orgId } : undefined,
                orderBy: { createdAt: 'desc' },
            });
        }
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        const membership = user.organizations.find((o) => o.organizationId === resolvedOrgId);
        if (membership && ['owner', 'admin'].includes(membership.role)) {
            return this.prisma.project.findMany({
                where: { organizationId: resolvedOrgId },
                orderBy: { createdAt: 'desc' },
            });
        }
        return this.prisma.project.findMany({
            where: {
                organizationId: resolvedOrgId,
                teamAssignments: { some: { workerId: user.id } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(user, id) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: {
                teamAssignments: { include: { worker: { select: { id: true, role: true } }, team: true } },
                projectMaterials: { include: { material: true } },
                fieldReports: { orderBy: { reportDate: 'desc' }, take: 10 },
            },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        this.assertCanRead(user, project);
        return project;
    }
    async create(user, dto, orgId) {
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, resolvedOrgId);
        return this.prisma.project.create({
            data: {
                ...dto,
                organizationId: resolvedOrgId,
                createdBy: user.id,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                status: dto.status ?? client_1.ProjectStatus.draft,
            },
        });
    }
    async update(user, id, dto) {
        const project = await this.findProjectOrThrow(id);
        (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
        return this.prisma.project.update({
            where: { id },
            data: {
                ...dto,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            },
        });
    }
    async remove(user, id) {
        const project = await this.findProjectOrThrow(id);
        (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
        await this.prisma.project.delete({ where: { id } });
        return { message: 'Project deleted' };
    }
    async findProjectOrThrow(id) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return project;
    }
    assertCanRead(user, project) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user))
            return;
        const membership = user.organizations.find((o) => o.organizationId === project.organizationId);
        if (membership && ['owner', 'admin'].includes(membership.role))
            return;
        const isAssigned = project.teamAssignments.some((a) => a.workerId === user.id);
        if (!isAssigned)
            throw new common_1.ForbiddenException('Access denied to this project');
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map