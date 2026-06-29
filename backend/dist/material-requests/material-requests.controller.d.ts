import { MaterialRequestsService } from './material-requests.service';
import { CreateMaterialRequestDto } from './dto/create-material-request.dto';
import { UpdateMaterialRequestDto } from './dto/update-material-request.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
export declare class MaterialRequestsController {
    private readonly service;
    constructor(service: MaterialRequestsService);
    findAll(user: AuthenticatedUser, orgId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        project: {
            id: string;
            title: string;
        };
        material: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.MaterialRequestStatus;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        materialId: string | null;
        unit: string;
        notes: string | null;
        reviewedBy: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal;
        requestedBy: string;
        materialName: string;
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
        material: {
            id: string;
            name: string;
            organizationId: string;
            description: string | null;
            status: import(".prisma/client").$Enums.MaterialStatus;
            createdAt: Date;
            updatedAt: Date;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            sku: string | null;
            unit: string;
            quantityOnHand: import("@prisma/client/runtime/library").Decimal;
            reorderLevel: import("@prisma/client/runtime/library").Decimal | null;
            supplierName: string | null;
            supplierPhone: string | null;
        } | null;
        requester: {
            email: string | null;
            id: string;
            name: string | null;
        };
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.MaterialRequestStatus;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        materialId: string | null;
        unit: string;
        notes: string | null;
        reviewedBy: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal;
        requestedBy: string;
        materialName: string;
    }>;
    create(user: AuthenticatedUser, dto: CreateMaterialRequestDto, orgId?: string): Promise<{
        project: {
            id: string;
            title: string;
        };
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.MaterialRequestStatus;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        materialId: string | null;
        unit: string;
        notes: string | null;
        reviewedBy: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal;
        requestedBy: string;
        materialName: string;
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateMaterialRequestDto): Promise<{
        project: {
            id: string;
            title: string;
        };
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.MaterialRequestStatus;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        materialId: string | null;
        unit: string;
        notes: string | null;
        reviewedBy: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal;
        requestedBy: string;
        materialName: string;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
}
