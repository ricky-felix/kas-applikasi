import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateCashFlowDto } from './dto/create-cash-flow.dto';
import { UpdateCashFlowDto } from './dto/update-cash-flow.dto';
export declare class CashFlowsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(user: AuthenticatedUser, orgId?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        organizationId: string;
        description: string | null;
        type: import(".prisma/client").$Enums.CashFlowType;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        category: import(".prisma/client").$Enums.CashFlowCategory;
        amount: import("@prisma/client/runtime/library").Decimal;
        referenceType: string | null;
        referenceId: string | null;
        transactionDate: Date;
    }[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        organizationId: string;
        description: string | null;
        type: import(".prisma/client").$Enums.CashFlowType;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        category: import(".prisma/client").$Enums.CashFlowCategory;
        amount: import("@prisma/client/runtime/library").Decimal;
        referenceType: string | null;
        referenceId: string | null;
        transactionDate: Date;
    }>;
    create(user: AuthenticatedUser, dto: CreateCashFlowDto, orgId: string): Promise<{
        id: string;
        organizationId: string;
        description: string | null;
        type: import(".prisma/client").$Enums.CashFlowType;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        category: import(".prisma/client").$Enums.CashFlowCategory;
        amount: import("@prisma/client/runtime/library").Decimal;
        referenceType: string | null;
        referenceId: string | null;
        transactionDate: Date;
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateCashFlowDto): Promise<{
        id: string;
        organizationId: string;
        description: string | null;
        type: import(".prisma/client").$Enums.CashFlowType;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        category: import(".prisma/client").$Enums.CashFlowCategory;
        amount: import("@prisma/client/runtime/library").Decimal;
        referenceType: string | null;
        referenceId: string | null;
        transactionDate: Date;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
    getSummary(user: AuthenticatedUser, orgId?: string): Promise<{
        totalIncome: number | import("@prisma/client/runtime/library").Decimal;
        totalExpense: number | import("@prisma/client/runtime/library").Decimal;
        netCashFlow: number;
    }>;
}
