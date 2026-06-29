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
exports.ProjectAssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const org_scope_helper_1 = require("../common/helpers/org-scope.helper");
let ProjectAssignmentsService = class ProjectAssignmentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByProject(user, projectId) {
        const project = await this.getProject(projectId);
        if (!(0, org_scope_helper_1.isSuperAdmin)(user)) {
            const membership = user.organizations.find((o) => o.organizationId === project.organizationId);
            if (!membership)
                throw new common_1.ForbiddenException();
            if (!['owner', 'admin'].includes(membership.role)) {
                return this.prisma.projectTeamAssignment.findMany({
                    where: { projectId, workerId: user.id },
                    include: { worker: { select: { id: true, name: true, email: true, phone: true } } },
                });
            }
        }
        return this.prisma.projectTeamAssignment.findMany({
            where: { projectId },
            include: { team: true, worker: { select: { id: true, name: true, email: true, phone: true } } },
        });
    }
    async findByWorker(user, workerId) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user)) {
            return this.prisma.projectTeamAssignment.findMany({
                where: { workerId },
                include: { project: true, team: true, worker: { select: { id: true, name: true, email: true, phone: true } } },
            });
        }
        if (user.id === workerId) {
            return this.prisma.projectTeamAssignment.findMany({
                where: { workerId },
                include: { project: true, team: true },
            });
        }
        const orgIds = user.organizations.filter(o => ['owner', 'admin'].includes(o.role)).map(o => o.organizationId);
        return this.prisma.projectTeamAssignment.findMany({
            where: { workerId, project: { organizationId: { in: orgIds } } },
            include: { project: true, team: true, worker: { select: { id: true, name: true, email: true, phone: true } } },
        });
    }
    async create(user, dto) {
        const project = await this.getProject(dto.projectId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
        return this.prisma.projectTeamAssignment.create({
            data: {
                projectId: dto.projectId,
                teamId: dto.teamId,
                workerId: dto.workerId,
                role: dto.role,
                assignedDate: new Date(dto.assignedDate),
                expectedEndDate: dto.expectedEndDate ? new Date(dto.expectedEndDate) : undefined,
                actualEndDate: dto.actualEndDate ? new Date(dto.actualEndDate) : undefined,
            },
        });
    }
    async update(user, id, dto) {
        const assignment = await this.prisma.projectTeamAssignment.findUnique({ where: { id } });
        if (!assignment)
            throw new common_1.NotFoundException('Assignment not found');
        const project = await this.getProject(assignment.projectId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
        return this.prisma.projectTeamAssignment.update({
            where: { id },
            data: {
                teamId: dto.teamId,
                workerId: dto.workerId,
                role: dto.role,
                assignedDate: dto.assignedDate ? new Date(dto.assignedDate) : undefined,
                expectedEndDate: dto.expectedEndDate ? new Date(dto.expectedEndDate) : undefined,
                actualEndDate: dto.actualEndDate ? new Date(dto.actualEndDate) : undefined,
            },
        });
    }
    async remove(user, id) {
        const assignment = await this.prisma.projectTeamAssignment.findUnique({ where: { id } });
        if (!assignment)
            throw new common_1.NotFoundException('Assignment not found');
        const project = await this.getProject(assignment.projectId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
        await this.prisma.projectTeamAssignment.delete({ where: { id } });
        return { message: 'Assignment removed' };
    }
    async getProject(projectId) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return project;
    }
};
exports.ProjectAssignmentsService = ProjectAssignmentsService;
exports.ProjectAssignmentsService = ProjectAssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectAssignmentsService);
//# sourceMappingURL=project-assignments.service.js.map