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
exports.MaterialsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const org_scope_helper_1 = require("../common/helpers/org-scope.helper");
let MaterialsService = class MaterialsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(user, orgId) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user)) {
            return this.prisma.material.findMany({ where: orgId ? { organizationId: orgId } : undefined });
        }
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, resolvedOrgId);
        return this.prisma.material.findMany({ where: { organizationId: resolvedOrgId } });
    }
    async findOne(user, id) {
        const material = await this.prisma.material.findUnique({ where: { id } });
        if (!material)
            throw new common_1.NotFoundException('Material not found');
        if (!(0, org_scope_helper_1.isSuperAdmin)(user))
            (0, org_scope_helper_1.assertOrgAdmin)(user, material.organizationId);
        return material;
    }
    async create(user, dto, orgId) {
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, resolvedOrgId);
        return this.prisma.material.create({ data: { ...dto, organizationId: resolvedOrgId } });
    }
    async update(user, id, dto) {
        const material = await this.prisma.material.findUnique({ where: { id } });
        if (!material)
            throw new common_1.NotFoundException('Material not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, material.organizationId);
        return this.prisma.material.update({ where: { id }, data: dto });
    }
    async remove(user, id) {
        const material = await this.prisma.material.findUnique({ where: { id } });
        if (!material)
            throw new common_1.NotFoundException('Material not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, material.organizationId);
        await this.prisma.material.delete({ where: { id } });
        return { message: 'Material deleted' };
    }
};
exports.MaterialsService = MaterialsService;
exports.MaterialsService = MaterialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaterialsService);
//# sourceMappingURL=materials.service.js.map