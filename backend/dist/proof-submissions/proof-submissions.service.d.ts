import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateProofSubmissionDto } from './dto/create-proof-submission.dto';
import { UpdateProofSubmissionDto } from './dto/update-proof-submission.dto';
export declare class ProofSubmissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(user: AuthenticatedUser, orgId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        invoice: {
            id: string;
            invoiceNumber: string;
        };
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.ProofStatus;
        fileUrl: string;
        notes: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        invoiceId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        submittedAt: Date;
    })[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
        invoice: {
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
        };
        reviewer: {
            id: string;
            name: string | null;
        } | null;
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.ProofStatus;
        fileUrl: string;
        notes: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        invoiceId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        submittedAt: Date;
    }>;
    create(user: AuthenticatedUser, dto: CreateProofSubmissionDto, orgId: string): Promise<{
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.ProofStatus;
        fileUrl: string;
        notes: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        invoiceId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        submittedAt: Date;
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateProofSubmissionDto): Promise<{
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.ProofStatus;
        fileUrl: string;
        notes: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        invoiceId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        submittedAt: Date;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
}
