import { MaterialStatus } from '@prisma/client';
export declare class CreateMaterialDto {
    name: string;
    description?: string;
    sku?: string;
    unit: string;
    unitPrice: number;
    quantityOnHand?: number;
    reorderLevel?: number;
    status?: MaterialStatus;
    supplierName?: string;
    supplierPhone?: string;
}
