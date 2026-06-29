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
exports.DailyAttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const org_scope_helper_1 = require("../common/helpers/org-scope.helper");
let DailyAttendanceService = class DailyAttendanceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(user, projectId) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user)) {
            return this.prisma.dailyAttendance.findMany({ where: projectId ? { projectId } : undefined });
        }
        const isAdmin = user.organizations.some((o) => ['owner', 'admin'].includes(o.role));
        if (isAdmin && projectId) {
            const project = await this.prisma.project.findUnique({ where: { id: projectId } });
            if (!project)
                throw new common_1.NotFoundException('Project not found');
            (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
            return this.prisma.dailyAttendance.findMany({ where: { projectId } });
        }
        return this.prisma.dailyAttendance.findMany({
            where: { workerId: user.id, ...(projectId ? { projectId } : {}) },
        });
    }
    async findOne(user, id) {
        const record = await this.prisma.dailyAttendance.findUnique({ where: { id } });
        if (!record)
            throw new common_1.NotFoundException('Attendance record not found');
        await this.assertCanRead(user, record);
        return record;
    }
    async create(user, dto) {
        const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        let workerId = user.id;
        if (dto.workerId && dto.workerId !== user.id) {
            (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
            workerId = dto.workerId;
        }
        return this.prisma.dailyAttendance.create({
            data: {
                projectId: dto.projectId,
                workerId,
                attendanceDate: new Date(dto.attendanceDate),
                status: dto.status ?? 'present',
                checkInTime: dto.checkInTime,
                checkOutTime: dto.checkOutTime,
                hoursWorked: dto.hoursWorked,
                notes: dto.notes,
            },
        });
    }
    async update(user, id, dto) {
        const record = await this.prisma.dailyAttendance.findUnique({ where: { id } });
        if (!record)
            throw new common_1.NotFoundException('Attendance record not found');
        if (!(0, org_scope_helper_1.isSuperAdmin)(user) && record.workerId !== user.id) {
            const project = await this.prisma.project.findUnique({ where: { id: record.projectId } });
            if (project)
                (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
        }
        return this.prisma.dailyAttendance.update({
            where: { id },
            data: {
                status: dto.status,
                checkInTime: dto.checkInTime,
                checkOutTime: dto.checkOutTime,
                hoursWorked: dto.hoursWorked,
                notes: dto.notes,
                attendanceDate: dto.attendanceDate ? new Date(dto.attendanceDate) : undefined,
            },
        });
    }
    async remove(user, id) {
        const record = await this.prisma.dailyAttendance.findUnique({ where: { id } });
        if (!record)
            throw new common_1.NotFoundException('Attendance record not found');
        const project = await this.prisma.project.findUnique({ where: { id: record.projectId } });
        if (project)
            (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
        await this.prisma.dailyAttendance.delete({ where: { id } });
        return { message: 'Attendance record deleted' };
    }
    async assertCanRead(user, record) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user))
            return;
        if (record.workerId === user.id)
            return;
        const project = await this.prisma.project.findUnique({ where: { id: record.projectId } });
        if (project)
            (0, org_scope_helper_1.assertOrgAdmin)(user, project.organizationId);
    }
};
exports.DailyAttendanceService = DailyAttendanceService;
exports.DailyAttendanceService = DailyAttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DailyAttendanceService);
//# sourceMappingURL=daily-attendance.service.js.map