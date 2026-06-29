import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
export declare class InvoicesController {
    private readonly service;
    constructor(service: InvoicesService);
    findPublic(invoiceNumber: string): Promise<{
        invoiceNumber: string;
        clientName: string;
        clientEmail: string | null;
        invoiceDate: Date;
        dueDate: Date;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        notes: string | null;
        lineItems: {
            description: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
        }[];
    }>;
    findAll(user: AuthenticatedUser, orgId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        lineItems: {
            id: string;
            description: string;
            createdAt: Date;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        organizationId: string;
        clientName: string;
        clientEmail: string | null;
        clientPhone: string | null;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        notes: string | null;
        requestId: string | null;
        invoiceNumber: string;
        invoiceDate: Date;
        dueDate: Date;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
        lineItems: {
            id: string;
            description: string;
            createdAt: Date;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        organizationId: string;
        clientName: string;
        clientEmail: string | null;
        clientPhone: string | null;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        notes: string | null;
        requestId: string | null;
        invoiceNumber: string;
        invoiceDate: Date;
        dueDate: Date;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    create(user: AuthenticatedUser, dto: CreateInvoiceDto, orgId?: string): Promise<{
        lineItems: {
            id: string;
            description: string;
            createdAt: Date;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        organizationId: string;
        clientName: string;
        clientEmail: string | null;
        clientPhone: string | null;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        notes: string | null;
        requestId: string | null;
        invoiceNumber: string;
        invoiceDate: Date;
        dueDate: Date;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateInvoiceDto): Promise<{
        lineItems: {
            id: string;
            description: string;
            createdAt: Date;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        organizationId: string;
        clientName: string;
        clientEmail: string | null;
        clientPhone: string | null;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        notes: string | null;
        requestId: string | null;
        invoiceNumber: string;
        invoiceDate: Date;
        dueDate: Date;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
}
