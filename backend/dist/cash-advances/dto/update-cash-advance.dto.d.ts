import { CashAdvanceStatus } from '@prisma/client';
import { CreateCashAdvanceDto } from './create-cash-advance.dto';
declare const UpdateCashAdvanceDto_base: import("@nestjs/common").Type<Partial<CreateCashAdvanceDto>>;
export declare class UpdateCashAdvanceDto extends UpdateCashAdvanceDto_base {
    status?: CashAdvanceStatus;
    approvedBy?: string;
}
export {};
