import { FieldWorkerStatus } from '@prisma/client';
export declare class ApproveWorkerRegistrationDto {
    userId: string;
    status?: FieldWorkerStatus;
    hireDate?: string;
    salaryPerDay?: number;
    bankAccount?: string;
    bankName?: string;
}
