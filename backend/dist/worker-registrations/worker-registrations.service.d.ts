import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateWorkerRegistrationDto } from './dto/create-worker-registration.dto';
import { UpdateWorkerRegistrationDto } from './dto/update-worker-registration.dto';
import { ApproveWorkerRegistrationDto } from './dto/approve-worker-registration.dto';
export declare class WorkerRegistrationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(user: AuthenticatedUser, orgId?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        phone: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.RegistrationStatus;
        createdAt: Date;
        specialization: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        fullName: string;
    }[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
        reviewer: {
            id: string;
            name: string | null;
        } | null;
    } & {
        id: string;
        phone: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.RegistrationStatus;
        createdAt: Date;
        specialization: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        fullName: string;
    }>;
    create(user: AuthenticatedUser, dto: CreateWorkerRegistrationDto, orgId: string): Promise<{
        id: string;
        phone: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.RegistrationStatus;
        createdAt: Date;
        specialization: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        fullName: string;
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateWorkerRegistrationDto): Promise<{
        id: string;
        phone: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.RegistrationStatus;
        createdAt: Date;
        specialization: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        fullName: string;
    }>;
    approve(user: AuthenticatedUser, id: string, dto: ApproveWorkerRegistrationDto): Promise<{
        registration: {
            id: string;
            status: string;
        };
        fieldWorker: {
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
        };
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
}
