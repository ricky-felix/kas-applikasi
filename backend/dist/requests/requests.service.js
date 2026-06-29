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
exports.RequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const org_scope_helper_1 = require("../common/helpers/org-scope.helper");
let RequestsService = class RequestsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(user, orgId) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user)) {
            return this.prisma.request.findMany({ where: orgId ? { organizationId: orgId } : undefined });
        }
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, resolvedOrgId);
        return this.prisma.request.findMany({ where: { organizationId: resolvedOrgId } });
    }
    async findOne(user, id) {
        const request = await this.prisma.request.findUnique({ where: { id } });
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        if (!(0, org_scope_helper_1.isSuperAdmin)(user))
            (0, org_scope_helper_1.assertOrgAdmin)(user, request.organizationId);
        return request;
    }
    async create(user, dto, orgId) {
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, resolvedOrgId);
        return this.prisma.request.create({
            data: {
                ...dto,
                organizationId: resolvedOrgId,
                createdBy: user.id,
                quoteValidUntil: dto.quoteValidUntil ? new Date(dto.quoteValidUntil) : undefined,
            },
        });
    }
    async update(user, id, dto) {
        const request = await this.prisma.request.findUnique({ where: { id } });
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, request.organizationId);
        return this.prisma.request.update({
            where: { id },
            data: {
                ...dto,
                quoteValidUntil: dto.quoteValidUntil ? new Date(dto.quoteValidUntil) : undefined,
                reviewedBy: dto.status && dto.status !== request.status ? user.id : undefined,
                reviewedAt: dto.status && dto.status !== request.status ? new Date() : undefined,
            },
        });
    }
    async remove(user, id) {
        const request = await this.prisma.request.findUnique({ where: { id } });
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, request.organizationId);
        await this.prisma.request.delete({ where: { id } });
        return { message: 'Request deleted' };
    }
};
exports.RequestsService = RequestsService;
exports.RequestsService = RequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RequestsService);
//# sourceMappingURL=requests.service.js.map