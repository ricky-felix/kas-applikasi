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
exports.FieldReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const org_scope_helper_1 = require("../common/helpers/org-scope.helper");
const client_1 = require("@prisma/client");
let FieldReportsService = class FieldReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(user, projectId) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user)) {
            return this.prisma.fieldReport.findMany({ where: projectId ? { projectId } : undefined, include: { attachments: true } });
        }
        const orgMemberships = user.organizations;
        const isAdmin = orgMemberships.some((o) => ['owner', 'admin'].includes(o.role));
        if (isAdmin && projectId) {
            const project = await this.prisma.project.findUnique({ where: { id: projectId } });
            if (!project)
                throw new common_1.NotFoundException('Project not found');
            (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
            return this.prisma.fieldReport.findMany({ where: { projectId }, include: { attachments: true } });
        }
        return this.prisma.fieldReport.findMany({
            where: { reportedBy: user.id, ...(projectId ? { projectId } : {}) },
            include: { attachments: true },
        });
    }
    async findOne(user, id) {
        const report = await this.prisma.fieldReport.findUnique({ where: { id }, include: { attachments: true } });
        if (!report)
            throw new common_1.NotFoundException('Field report not found');
        await this.assertCanRead(user, report);
        return report;
    }
    async create(user, dto) {
        const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (!(0, org_scope_helper_1.isSuperAdmin)(user)) {
            const membership = user.organizations.find((o) => o.organizationId === project.organizationId);
            if (membership && ['owner', 'admin'].includes(membership.role)) {
            }
            else {
                const assignment = await this.prisma.projectTeamAssignment.findFirst({
                    where: { projectId: dto.projectId, workerId: user.id },
                });
                if (!assignment)
                    throw new common_1.ForbiddenException('Not assigned to this project');
            }
        }
        return this.prisma.fieldReport.create({
            data: {
                ...dto,
                reportedBy: user.id,
                reportDate: new Date(dto.reportDate),
                status: dto.status ?? client_1.FieldReportStatus.draft,
            },
        });
    }
    async update(user, id, dto) {
        const report = await this.prisma.fieldReport.findUnique({ where: { id } });
        if (!report)
            throw new common_1.NotFoundException('Field report not found');
        if (!(0, org_scope_helper_1.isSuperAdmin)(user)) {
            const project = await this.prisma.project.findUnique({ where: { id: report.projectId } });
            if (!project)
                throw new common_1.NotFoundException();
            const membership = user.organizations.find((o) => o.organizationId === project.organizationId);
            if (membership && ['owner', 'admin'].includes(membership.role)) {
            }
            else if (report.reportedBy === user.id) {
                if (report.status !== client_1.FieldReportStatus.draft) {
                    throw new common_1.ForbiddenException('Only draft reports can be updated by the reporter');
                }
            }
            else {
                throw new common_1.ForbiddenException('Access denied');
            }
        }
        return this.prisma.fieldReport.update({
            where: { id },
            data: {
                ...dto,
                reportDate: dto.reportDate ? new Date(dto.reportDate) : undefined,
            },
        });
    }
    async remove(user, id) {
        const report = await this.prisma.fieldReport.findUnique({ where: { id } });
        if (!report)
            throw new common_1.NotFoundException('Field report not found');
        const project = await this.prisma.project.findUnique({ where: { id: report.projectId } });
        if (!project)
            throw new common_1.NotFoundException();
        (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
        await this.prisma.fieldReport.delete({ where: { id } });
        return { message: 'Field report deleted' };
    }
    async addAttachment(user, reportId, dto) {
        const report = await this.prisma.fieldReport.findUnique({ where: { id: reportId } });
        if (!report)
            throw new common_1.NotFoundException('Field report not found');
        if (!(0, org_scope_helper_1.isSuperAdmin)(user) && report.reportedBy !== user.id) {
            const project = await this.prisma.project.findUnique({ where: { id: report.projectId } });
            if (project)
                (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
        }
        return this.prisma.fieldReportAttachment.create({
            data: { fieldReportId: reportId, ...dto },
        });
    }
    async removeAttachment(user, attachmentId) {
        const att = await this.prisma.fieldReportAttachment.findUnique({ where: { id: attachmentId } });
        if (!att)
            throw new common_1.NotFoundException('Attachment not found');
        const report = await this.prisma.fieldReport.findUnique({ where: { id: att.fieldReportId } });
        if (!report)
            throw new common_1.NotFoundException();
        if (!(0, org_scope_helper_1.isSuperAdmin)(user) && report.reportedBy !== user.id) {
            const project = await this.prisma.project.findUnique({ where: { id: report.projectId } });
            if (project)
                (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
        }
        await this.prisma.fieldReportAttachment.delete({ where: { id: attachmentId } });
        return { message: 'Attachment removed' };
    }
    async assertCanRead(user, report) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user))
            return;
        if (report.reportedBy === user.id)
            return;
        const project = await this.prisma.project.findUnique({ where: { id: report.projectId } });
        if (!project)
            return;
        (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
    }
};
exports.FieldReportsService = FieldReportsService;
exports.FieldReportsService = FieldReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FieldReportsService);
//# sourceMappingURL=field-reports.service.js.map