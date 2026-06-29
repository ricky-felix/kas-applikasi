import { CashAdvancesService } from './cash-advances.service';
import { CreateCashAdvanceDto } from './dto/create-cash-advance.dto';
import { UpdateCashAdvanceDto } from './dto/update-cash-advance.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
export declare class CashAdvancesController {
    private readonly service;
    constructor(service: CashAdvancesService);
    findAll(user: AuthenticatedUser, orgId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        worker: {
            id: string;
            name: string | null;
        };
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.CashAdvanceStatus;
        createdAt: Date;
        updatedAt: Date;
        workerId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        reason: string;
        advanceDate: Date;
        approvedBy: string | null;
    })[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
        worker: {
            email: string | null;
            id: string;
            name: string | null;
        };
        approver: {
            id: string;
            name: string | null;
        } | null;
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.CashAdvanceStatus;
        createdAt: Date;
        updatedAt: Date;
        workerId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        reason: string;
        advanceDate: Date;
        approvedBy: string | null;
    }>;
    create(user: AuthenticatedUser, dto: CreateCashAdvanceDto, orgId?: string): Promise<{
        worker: {
            id: string;
            name: string | null;
        };
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.CashAdvanceStatus;
        createdAt: Date;
        updatedAt: Date;
        workerId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        reason: string;
        advanceDate: Date;
        approvedBy: string | null;
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateCashAdvanceDto): Promise<{
        worker: {
            id: string;
            name: string | null;
        };
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.CashAdvanceStatus;
        createdAt: Date;
        updatedAt: Date;
        workerId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        reason: string;
        advanceDate: Date;
        approvedBy: string | null;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
}
