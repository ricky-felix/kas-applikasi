import { MaterialRequestStatus } from '@prisma/client';
export declare class CreateMaterialRequestDto {
    projectId: string;
    materialId?: string;
    materialName: string;
    quantity: number;
    unit: string;
    status?: MaterialRequestStatus;
    notes?: string;
}
