import { FieldWorkersService } from './field-workers.service';
import { CreateFieldWorkerDto } from './dto/create-field-worker.dto';
import { UpdateFieldWorkerDto } from './dto/update-field-worker.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
export declare class FieldWorkersController {
    private readonly fieldWorkersService;
    constructor(fieldWorkersService: FieldWorkersService);
    findWithProfile(user: AuthenticatedUser, orgId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        user: {
            email: string | null;
            id: string;
            name: string | null;
            phone: string | null;
        };
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.FieldWorkerStatus;
        createdAt: Date;
        updatedAt: Date;
        specialization: string | null;
        hireDate: Date | null;
        salaryPerDay: import("@prisma/client/runtime/library").Decimal | null;
        bankAccount: string | null;
        bankName: string | null;
    })[]>;
    findAll(user: AuthenticatedUser, orgId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        user: {
            email: string | null;
            id: string;
            name: string | null;
            phone: string | null;
        };
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.FieldWorkerStatus;
        createdAt: Date;
        updatedAt: Date;
        specialization: string | null;
        hireDate: Date | null;
        salaryPerDay: import("@prisma/client/runtime/library").Decimal | null;
        bankAccount: string | null;
        bankName: string | null;
    })[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
        user: {
            email: string | null;
            id: string;
            name: string | null;
            phone: string | null;
        };
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.FieldWorkerStatus;
        createdAt: Date;
        updatedAt: Date;
        specialization: string | null;
        hireDate: Date | null;
        salaryPerDay: import("@prisma/client/runtime/library").Decimal | null;
        bankAccount: string | null;
        bankName: string | null;
    }>;
    create(user: AuthenticatedUser, dto: CreateFieldWorkerDto, orgId?: string): Promise<{
        user: {
            email: string | null;
            id: string;
            name: string | null;
            phone: string | null;
        };
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.FieldWorkerStatus;
        createdAt: Date;
        updatedAt: Date;
        specialization: string | null;
        hireDate: Date | null;
        salaryPerDay: import("@prisma/client/runtime/library").Decimal | null;
        bankAccount: string | null;
        bankName: string | null;
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateFieldWorkerDto): Promise<{
        user: {
            email: string | null;
            id: string;
            name: string | null;
            phone: string | null;
        };
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.FieldWorkerStatus;
        createdAt: Date;
        updatedAt: Date;
        specialization: string | null;
        hireDate: Date | null;
        salaryPerDay: import("@prisma/client/runtime/library").Decimal | null;
        bankAccount: string | null;
        bankName: string | null;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
}
