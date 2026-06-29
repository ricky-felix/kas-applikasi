import { InvoiceStatus } from '@prisma/client';
import { CreateInvoiceLineItemDto } from './create-invoice-line-item.dto';
export declare class CreateInvoiceDto {
    projectId?: string;
    requestId?: string;
    invoiceNumber: string;
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    invoiceDate: string;
    dueDate: string;
    taxAmount?: number;
    discountAmount?: number;
    paidAmount?: number;
    status?: InvoiceStatus;
    paymentMethod?: string;
    notes?: string;
    lineItems: CreateInvoiceLineItemDto[];
}
