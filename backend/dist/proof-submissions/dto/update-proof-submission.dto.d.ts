import { ProofStatus } from '@prisma/client';
export declare class UpdateProofSubmissionDto {
    status?: ProofStatus;
    reviewedBy?: string;
    reviewedAt?: string;
    notes?: string;
}
