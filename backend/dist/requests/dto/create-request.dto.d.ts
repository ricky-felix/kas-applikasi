import { RequestStatus } from '@prisma/client';
export declare class CreateRequestDto {
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    requestType?: string;
    description: string;
    location?: string;
    status?: RequestStatus;
    estimatedBudget?: number;
    quotedAmount?: number;
    quoteValidUntil?: string;
    notes?: string;
}
