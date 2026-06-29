import { MaterialRequestStatus } from '@prisma/client';
import { CreateMaterialRequestDto } from './create-material-request.dto';
declare const UpdateMaterialRequestDto_base: import("@nestjs/common").Type<Partial<CreateMaterialRequestDto>>;
export declare class UpdateMaterialRequestDto extends UpdateMaterialRequestDto_base {
    status?: MaterialRequestStatus;
    reviewedBy?: string;
}
export {};
