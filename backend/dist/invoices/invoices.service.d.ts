import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Decimal } from '@prisma/client/runtime/library';
export declare class InvoicesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(user: AuthenticatedUser, orgId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        lineItems: {
            id: string;
            description: string;
            createdAt: Date;
            unitPrice: Decimal;
            quantity: Decimal;
            invoiceId: string;
            lineTotal: Decimal;
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
        taxAmount: Decimal;
        discountAmount: Decimal;
        paidAmount: Decimal;
        paymentMethod: string | null;
        subtotal: Decimal;
        totalAmount: Decimal;
    })[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
        lineItems: {
            id: string;
            description: string;
            createdAt: Date;
            unitPrice: Decimal;
            quantity: Decimal;
            invoiceId: string;
            lineTotal: Decimal;
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
        taxAmount: Decimal;
        discountAmount: Decimal;
        paidAmount: Decimal;
        paymentMethod: string | null;
        subtotal: Decimal;
        totalAmount: Decimal;
    }>;
    create(user: AuthenticatedUser, dto: CreateInvoiceDto, orgId: string): Promise<{
        lineItems: {
            id: string;
            description: string;
            createdAt: Date;
            unitPrice: Decimal;
            quantity: Decimal;
            invoiceId: string;
            lineTotal: Decimal;
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
        taxAmount: Decimal;
        discountAmount: Decimal;
        paidAmount: Decimal;
        paymentMethod: string | null;
        subtotal: Decimal;
        totalAmount: Decimal;
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateInvoiceDto): Promise<{
        lineItems: {
            id: string;
            description: string;
            createdAt: Date;
            unitPrice: Decimal;
            quantity: Decimal;
            invoiceId: string;
            lineTotal: Decimal;
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
        taxAmount: Decimal;
        discountAmount: Decimal;
        paidAmount: Decimal;
        paymentMethod: string | null;
        subtotal: Decimal;
        totalAmount: Decimal;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
    findPublic(invoiceNumber: string): Promise<{
        invoiceNumber: string;
        clientName: string;
        clientEmail: string | null;
        invoiceDate: Date;
        dueDate: Date;
        subtotal: Decimal;
        taxAmount: Decimal;
        discountAmount: Decimal;
        totalAmount: Decimal;
        paidAmount: Decimal;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        notes: string | null;
        lineItems: {
            description: string;
            quantity: Decimal;
            unitPrice: Decimal;
            lineTotal: Decimal;
        }[];
    }>;
}
