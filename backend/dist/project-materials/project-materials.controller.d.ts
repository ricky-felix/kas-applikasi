import { ProjectMaterialsService } from './project-materials.service';
import { CreateProjectMaterialDto } from './dto/create-project-material.dto';
import { UpdateProjectMaterialDto } from './dto/update-project-material.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
export declare class ProjectMaterialsController {
    private readonly service;
    constructor(service: ProjectMaterialsService);
    findByProject(user: AuthenticatedUser, projectId: string): Promise<({
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
        };
    } & {
        id: string;
        projectId: string;
        materialId: string;
        quantityPlanned: import("@prisma/client/runtime/library").Decimal;
        quantityUsed: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        totalCost: import("@prisma/client/runtime/library").Decimal | null;
        deliveryDate: Date | null;
        addedAt: Date;
    })[]>;
    create(user: AuthenticatedUser, dto: CreateProjectMaterialDto): Promise<{
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
        };
    } & {
        id: string;
        projectId: string;
        materialId: string;
        quantityPlanned: import("@prisma/client/runtime/library").Decimal;
        quantityUsed: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        totalCost: import("@prisma/client/runtime/library").Decimal | null;
        deliveryDate: Date | null;
        addedAt: Date;
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateProjectMaterialDto): Promise<{
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
        };
    } & {
        id: string;
        projectId: string;
        materialId: string;
        quantityPlanned: import("@prisma/client/runtime/library").Decimal;
        quantityUsed: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        totalCost: import("@prisma/client/runtime/library").Decimal | null;
        deliveryDate: Date | null;
        addedAt: Date;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
}
