import { RegistrationStatus } from '@prisma/client';
export declare class UpdateWorkerRegistrationDto {
    status?: RegistrationStatus;
    reviewedBy?: string;
    reviewedAt?: string;
}
