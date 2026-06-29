import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
export declare class MaterialsController {
    private readonly materialsService;
    constructor(materialsService: MaterialsService);
    findAll(user: AuthenticatedUser, orgId?: string): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
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
    }>;
    create(user: AuthenticatedUser, dto: CreateMaterialDto, orgId?: string): Promise<{
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
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateMaterialDto): Promise<{
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
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
}
