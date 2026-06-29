import { ProjectStatus } from '@prisma/client';
export declare class CreateProjectDto {
    title: string;
    description?: string;
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    location: string;
    latitude?: number;
    longitude?: number;
    status?: ProjectStatus;
    startDate?: string;
    endDate?: string;
    plannedBudget?: number;
    actualBudget?: number;
    projectManagerId?: string;
}
