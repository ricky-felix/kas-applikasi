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
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const org_scope_helper_1 = require("../common/helpers/org-scope.helper");
let TeamsService = class TeamsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(user, orgId) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user)) {
            return this.prisma.team.findMany({
                where: orgId ? { organizationId: orgId } : undefined,
                include: { members: true },
            });
        }
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, resolvedOrgId);
        return this.prisma.team.findMany({
            where: { organizationId: resolvedOrgId },
            include: { members: true },
        });
    }
    async findOne(user, id) {
        const team = await this.prisma.team.findUnique({
            where: { id },
            include: { members: { include: { worker: { select: { id: true, role: true } } } } },
        });
        if (!team)
            throw new common_1.NotFoundException('Team not found');
        if (!(0, org_scope_helper_1.isSuperAdmin)(user))
            (0, org_scope_helper_1.assertOrgAdmin)(user, team.organizationId);
        return team;
    }
    async create(user, dto, orgId) {
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, resolvedOrgId);
        return this.prisma.team.create({ data: { ...dto, organizationId: resolvedOrgId } });
    }
    async update(user, id, dto) {
        const team = await this.prisma.team.findUnique({ where: { id } });
        if (!team)
            throw new common_1.NotFoundException('Team not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, team.organizationId);
        return this.prisma.team.update({ where: { id }, data: dto });
    }
    async remove(user, id) {
        const team = await this.prisma.team.findUnique({ where: { id } });
        if (!team)
            throw new common_1.NotFoundException('Team not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, team.organizationId);
        await this.prisma.team.delete({ where: { id } });
        return { message: 'Team deleted' };
    }
    async addMember(user, teamId, dto) {
        const team = await this.prisma.team.findUnique({ where: { id: teamId } });
        if (!team)
            throw new common_1.NotFoundException('Team not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, team.organizationId);
        return this.prisma.teamMember.create({
            data: { teamId, workerId: dto.workerId, role: dto.role },
        });
    }
    async removeMember(user, teamId, workerId) {
        const team = await this.prisma.team.findUnique({ where: { id: teamId } });
        if (!team)
            throw new common_1.NotFoundException('Team not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, team.organizationId);
        await this.prisma.teamMember.deleteMany({ where: { teamId, workerId } });
        return { message: 'Member removed' };
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeamsService);
//# sourceMappingURL=teams.service.js.map