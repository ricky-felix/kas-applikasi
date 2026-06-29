import { ChangeOrdersService } from './change-orders.service';
import { CreateChangeOrderDto } from './dto/create-change-order.dto';
import { UpdateChangeOrderDto } from './dto/update-change-order.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
export declare class ChangeOrdersController {
    private readonly service;
    constructor(service: ChangeOrdersService);
    findAll(user: AuthenticatedUser, orgId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        project: {
            id: string;
            title: string;
        };
        requester: {
            id: string;
            name: string | null;
        };
    } & {
        id: string;
        organizationId: string;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.ChangeOrderStatus;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        requestedBy: string;
    })[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
        project: {
            id: string;
            organizationId: string;
            description: string | null;
            title: string;
            clientName: string;
            clientEmail: string | null;
            clientPhone: string | null;
            location: string;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            status: import(".prisma/client").$Enums.ProjectStatus;
            startDate: Date | null;
            endDate: Date | null;
            plannedBudget: import("@prisma/client/runtime/library").Decimal | null;
            actualBudget: import("@prisma/client/runtime/library").Decimal | null;
            projectManagerId: string | null;
            createdBy: string;
            createdAt: Date;
            updatedAt: Date;
        };
        reviewer: {
            id: string;
            name: string | null;
        } | null;
        requester: {
            email: string | null;
            id: string;
            name: string | null;
        };
    } & {
        id: string;
        organizationId: string;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.ChangeOrderStatus;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        requestedBy: string;
    }>;
    create(user: AuthenticatedUser, dto: CreateChangeOrderDto, orgId?: string): Promise<{
        project: {
            id: string;
            title: string;
        };
    } & {
        id: string;
        organizationId: string;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.ChangeOrderStatus;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        requestedBy: string;
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateChangeOrderDto): Promise<{
        project: {
            id: string;
            title: string;
        };
    } & {
        id: string;
        organizationId: string;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.ChangeOrderStatus;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        requestedBy: string;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
}
