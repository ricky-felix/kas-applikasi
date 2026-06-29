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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const org_scope_helper_1 = require("../common/helpers/org-scope.helper");
const library_1 = require("@prisma/client/runtime/library");
let InvoicesService = class InvoicesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(user, orgId) {
        if ((0, org_scope_helper_1.isSuperAdmin)(user)) {
            return this.prisma.invoice.findMany({
                where: orgId ? { organizationId: orgId } : undefined,
                include: { lineItems: true },
            });
        }
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, resolvedOrgId);
        return this.prisma.invoice.findMany({
            where: { organizationId: resolvedOrgId },
            include: { lineItems: true },
        });
    }
    async findOne(user, id) {
        const invoice = await this.prisma.invoice.findUnique({ where: { id }, include: { lineItems: true } });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        if (!(0, org_scope_helper_1.isSuperAdmin)(user))
            (0, org_scope_helper_1.assertOrgAdmin)(user, invoice.organizationId);
        return invoice;
    }
    async create(user, dto, orgId) {
        const resolvedOrgId = (0, org_scope_helper_1.resolveOrgId)(user, orgId);
        (0, org_scope_helper_1.assertOrgAdmin)(user, resolvedOrgId);
        const lineItemsWithTotals = dto.lineItems.map((li) => ({
            ...li,
            lineTotal: new library_1.Decimal(li.quantity).mul(new library_1.Decimal(li.unitPrice)),
        }));
        const subtotal = lineItemsWithTotals.reduce((sum, li) => sum.add(li.lineTotal), new library_1.Decimal(0));
        const taxAmount = new library_1.Decimal(dto.taxAmount ?? 0);
        const discountAmount = new library_1.Decimal(dto.discountAmount ?? 0);
        const totalAmount = subtotal.add(taxAmount).sub(discountAmount);
        return this.prisma.invoice.create({
            data: {
                organizationId: resolvedOrgId,
                projectId: dto.projectId,
                requestId: dto.requestId,
                invoiceNumber: dto.invoiceNumber,
                clientName: dto.clientName,
                clientEmail: dto.clientEmail,
                clientPhone: dto.clientPhone,
                invoiceDate: new Date(dto.invoiceDate),
                dueDate: new Date(dto.dueDate),
                subtotal,
                taxAmount,
                discountAmount,
                totalAmount,
                paidAmount: dto.paidAmount ?? 0,
                status: dto.status,
                paymentMethod: dto.paymentMethod,
                notes: dto.notes,
                createdBy: user.id,
                lineItems: {
                    create: lineItemsWithTotals.map((li) => ({
                        description: li.description,
                        quantity: li.quantity,
                        unitPrice: li.unitPrice,
                        lineTotal: li.lineTotal,
                    })),
                },
            },
            include: { lineItems: true },
        });
    }
    async update(user, id, dto) {
        const invoice = await this.prisma.invoice.findUnique({ where: { id } });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, invoice.organizationId);
        let updateData = {
            clientName: dto.clientName,
            clientEmail: dto.clientEmail,
            clientPhone: dto.clientPhone,
            invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            paidAmount: dto.paidAmount,
            status: dto.status,
            paymentMethod: dto.paymentMethod,
            notes: dto.notes,
        };
        if (dto.lineItems && dto.lineItems.length > 0) {
            const lineItemsWithTotals = dto.lineItems.map((li) => ({
                ...li,
                lineTotal: new library_1.Decimal(li.quantity).mul(new library_1.Decimal(li.unitPrice)),
            }));
            const subtotal = lineItemsWithTotals.reduce((sum, li) => sum.add(li.lineTotal), new library_1.Decimal(0));
            const taxAmount = new library_1.Decimal(dto.taxAmount ?? Number(invoice.taxAmount));
            const discountAmount = new library_1.Decimal(dto.discountAmount ?? Number(invoice.discountAmount));
            const totalAmount = subtotal.add(taxAmount).sub(discountAmount);
            updateData = {
                ...updateData,
                subtotal,
                taxAmount,
                discountAmount,
                totalAmount,
                lineItems: {
                    deleteMany: {},
                    create: lineItemsWithTotals.map((li) => ({
                        description: li.description,
                        quantity: li.quantity,
                        unitPrice: li.unitPrice,
                        lineTotal: li.lineTotal,
                    })),
                },
            };
        }
        return this.prisma.invoice.update({ where: { id }, data: updateData, include: { lineItems: true } });
    }
    async remove(user, id) {
        const invoice = await this.prisma.invoice.findUnique({ where: { id } });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        (0, org_scope_helper_1.assertOrgAdmin)(user, invoice.organizationId);
        await this.prisma.invoice.delete({ where: { id } });
        return { message: 'Invoice deleted' };
    }
    async findPublic(invoiceNumber) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { invoiceNumber },
            include: { lineItems: true },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        return {
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.clientName,
            clientEmail: invoice.clientEmail,
            invoiceDate: invoice.invoiceDate,
            dueDate: invoice.dueDate,
            subtotal: invoice.subtotal,
            taxAmount: invoice.taxAmount,
            discountAmount: invoice.discountAmount,
            totalAmount: invoice.totalAmount,
            paidAmount: invoice.paidAmount,
            status: invoice.status,
            notes: invoice.notes,
            lineItems: invoice.lineItems.map((li) => ({
                description: li.description,
                quantity: li.quantity,
                unitPrice: li.unitPrice,
                lineTotal: li.lineTotal,
            })),
        };
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map