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
exports.ProofSubmissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const org_scope_helper_1 = require("../common/helpers/org-scope.helper");
let ProofSubmissionsService = class ProofSubmissionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(user, orgId) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user)) {
            return this.prisma.proofSubmission.findMany({
                where: orgId ? { organizationId: orgId } : undefined,
                include: { invoice: { select: { id: true, invoiceNumber: true } } },
                orderBy: { submittedAt: 'desc' },
            });
        }
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, resolvedOrgId);
        return this.prisma.proofSubmission.findMany({
            where: { organizationId: resolvedOrgId },
            include: { invoice: { select: { id: true, invoiceNumber: true } } },
            orderBy: { submittedAt: 'desc' },
        });
    }
    async findOne(user, id) {
        const ps = await this.prisma.proofSubmission.findUnique({
            where: { id },
            include: { invoice: true, reviewer: { select: { id: true, name: true } } },
        });
        if (!ps)
            throw new common_1.NotFoundException('Proof submission not found');
        if (!(0, org_scope_helper_1.isSuperAdmin)(user))
            (0, org_scope_helper_1.assertOrgAdmin)(user, ps.organizationId);
        return ps;
    }
    async create(user, dto, orgId) {
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        const invoice = await this.prisma.invoice.findUnique({ where: { id: dto.invoiceId } });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        return this.prisma.proofSubmission.create({
            data: {
                organizationId: resolvedOrgId,
                invoiceId: dto.invoiceId,
                fileUrl: dto.fileUrl,
                amount: dto.amount,
                notes: dto.notes,
            },
        });
    }
    async update(user, id, dto) {
        const ps = await this.prisma.proofSubmission.findUnique({ where: { id } });
        if (!ps)
            throw new common_1.NotFoundException('Proof submission not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, ps.organizationId);
        return this.prisma.proofSubmission.update({
            where: { id },
            data: {
                status: dto.status,
                reviewedBy: dto.reviewedBy,
                reviewedAt: dto.reviewedAt ? new Date(dto.reviewedAt) : undefined,
                notes: dto.notes,
            },
        });
    }
    async remove(user, id) {
        const ps = await this.prisma.proofSubmission.findUnique({ where: { id } });
        if (!ps)
            throw new common_1.NotFoundException('Proof submission not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, ps.organizationId);
        await this.prisma.proofSubmission.delete({ where: { id } });
        return { message: 'Proof submission deleted' };
    }
};
exports.ProofSubmissionsService = ProofSubmissionsService;
exports.ProofSubmissionsService = ProofSubmissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProofSubmissionsService);
//# sourceMappingURL=proof-submissions.service.js.map