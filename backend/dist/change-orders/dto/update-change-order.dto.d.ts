import { ChangeOrderStatus } from '@prisma/client';
import { CreateChangeOrderDto } from './create-change-order.dto';
declare const UpdateChangeOrderDto_base: import("@nestjs/common").Type<Partial<CreateChangeOrderDto>>;
export declare class UpdateChangeOrderDto extends UpdateChangeOrderDto_base {
    status?: ChangeOrderStatus;
    reviewedBy?: string;
    reviewedAt?: string;
}
export {};
