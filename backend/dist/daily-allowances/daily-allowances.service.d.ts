import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateDailyAllowanceDto } from './dto/create-daily-allowance.dto';
import { UpdateDailyAllowanceDto } from './dto/update-daily-allowance.dto';
export declare class DailyAllowancesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(user: AuthenticatedUser, orgId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        project: {
            id: string;
            title: string;
        } | null;
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        workerId: string;
        projectId: string | null;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        allowanceType: string;
        allowanceDate: Date;
    })[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
        project: {
            id: string;
            title: string;
        } | null;
        worker: {
            email: string | null;
            id: string;
            name: string | null;
        };
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        workerId: string;
        projectId: string | null;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        allowanceType: string;
        allowanceDate: Date;
    }>;
    create(user: AuthenticatedUser, dto: CreateDailyAllowanceDto, orgId: string): Promise<{
        worker: {
            id: string;
            name: string | null;
        };
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        workerId: string;
        projectId: string | null;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        allowanceType: string;
        allowanceDate: Date;
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateDailyAllowanceDto): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        workerId: string;
        projectId: string | null;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        allowanceType: string;
        allowanceDate: Date;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
}
