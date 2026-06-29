import { FieldReportStatus } from '@prisma/client';
export declare class CreateFieldReportDto {
    projectId: string;
    reportDate: string;
    status?: FieldReportStatus;
    progressPercentage?: number;
    workDescription?: string;
    weatherCondition?: string;
    challenges?: string;
    materialUsageNotes?: string;
    safetyNotes?: string;
}
