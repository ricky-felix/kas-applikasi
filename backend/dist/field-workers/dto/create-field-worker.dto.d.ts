import { FieldWorkerStatus } from '@prisma/client';
export declare class CreateFieldWorkerDto {
    id: string;
    specialization?: string;
    status?: FieldWorkerStatus;
    hireDate?: string;
    salaryPerDay?: number;
    bankAccount?: string;
    bankName?: string;
}
