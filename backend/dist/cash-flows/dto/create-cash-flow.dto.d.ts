import { CashFlowType, CashFlowCategory } from '@prisma/client';
export declare class CreateCashFlowDto {
    type: CashFlowType;
    category: CashFlowCategory;
    amount: number;
    description?: string;
    referenceType?: string;
    referenceId?: string;
    transactionDate: string;
    notes?: string;
}
