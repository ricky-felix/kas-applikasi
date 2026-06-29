import { CashAdvanceStatus } from '@prisma/client';
export declare class CreateCashAdvanceDto {
    workerId?: string;
    amount: number;
    reason: string;
    advanceDate: string;
    status?: CashAdvanceStatus;
}
