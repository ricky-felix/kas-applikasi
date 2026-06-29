import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateProjectMaterialDto } from './dto/create-project-material.dto';
import { UpdateProjectMaterialDto } from './dto/update-project-material.dto';
import { Decimal } from '@prisma/client/runtime/library';
export declare class ProjectMaterialsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByProject(user: AuthenticatedUser, projectId: string): Promise<({
        material: {
            id: string;
            name: string;
            organizationId: string;
            description: string | null;
            status: import(".prisma/client").$Enums.MaterialStatus;
            createdAt: Date;
            updatedAt: Date;
            unitPrice: Decimal;
            sku: string | null;
            unit: string;
            quantityOnHand: Decimal;
            reorderLevel: Decimal | null;
            supplierName: string | null;
            supplierPhone: string | null;
        };
    } & {
        id: string;
        projectId: string;
        materialId: string;
        quantityPlanned: Decimal;
        quantityUsed: Decimal;
        unitPrice: Decimal;
        totalCost: Decimal | null;
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
            unitPrice: Decimal;
            sku: string | null;
            unit: string;
            quantityOnHand: Decimal;
            reorderLevel: Decimal | null;
            supplierName: string | null;
            supplierPhone: string | null;
        };
    } & {
        id: string;
        projectId: string;
        materialId: string;
        quantityPlanned: Decimal;
        quantityUsed: Decimal;
        unitPrice: Decimal;
        totalCost: Decimal | null;
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
            unitPrice: Decimal;
            sku: string | null;
            unit: string;
            quantityOnHand: Decimal;
            reorderLevel: Decimal | null;
            supplierName: string | null;
            supplierPhone: string | null;
        };
    } & {
        id: string;
        projectId: string;
        materialId: string;
        quantityPlanned: Decimal;
        quantityUsed: Decimal;
        unitPrice: Decimal;
        totalCost: Decimal | null;
        deliveryDate: Date | null;
        addedAt: Date;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
    private getProject;
}
