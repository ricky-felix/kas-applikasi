import { FieldReportsService } from './field-reports.service';
import { CreateFieldReportDto } from './dto/create-field-report.dto';
import { UpdateFieldReportDto } from './dto/update-field-report.dto';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
export declare class FieldReportsController {
    private readonly service;
    constructor(service: FieldReportsService);
    findAll(user: AuthenticatedUser, projectId?: string): Promise<({
        attachments: {
            id: string;
            fileUrl: string;
            fileName: string | null;
            attachmentType: string | null;
            fieldReportId: string;
            uploadedAt: Date;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.FieldReportStatus;
        createdAt: Date;
        updatedAt: Date;
        reportDate: Date;
        projectId: string;
        reportedBy: string;
        progressPercentage: import("@prisma/client/runtime/library").Decimal | null;
        workDescription: string | null;
        weatherCondition: string | null;
        challenges: string | null;
        materialUsageNotes: string | null;
        safetyNotes: string | null;
    })[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
        attachments: {
            id: string;
            fileUrl: string;
            fileName: string | null;
            attachmentType: string | null;
            fieldReportId: string;
            uploadedAt: Date;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.FieldReportStatus;
        createdAt: Date;
        updatedAt: Date;
        reportDate: Date;
        projectId: string;
        reportedBy: string;
        progressPercentage: import("@prisma/client/runtime/library").Decimal | null;
        workDescription: string | null;
        weatherCondition: string | null;
        challenges: string | null;
        materialUsageNotes: string | null;
        safetyNotes: string | null;
    }>;
    create(user: AuthenticatedUser, dto: CreateFieldReportDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.FieldReportStatus;
        createdAt: Date;
        updatedAt: Date;
        reportDate: Date;
        projectId: string;
        reportedBy: string;
        progressPercentage: import("@prisma/client/runtime/library").Decimal | null;
        workDescription: string | null;
        weatherCondition: string | null;
        challenges: string | null;
        materialUsageNotes: string | null;
        safetyNotes: string | null;
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateFieldReportDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.FieldReportStatus;
        createdAt: Date;
        updatedAt: Date;
        reportDate: Date;
        projectId: string;
        reportedBy: string;
        progressPercentage: import("@prisma/client/runtime/library").Decimal | null;
        workDescription: string | null;
        weatherCondition: string | null;
        challenges: string | null;
        materialUsageNotes: string | null;
        safetyNotes: string | null;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
    addAttachment(user: AuthenticatedUser, id: string, dto: CreateAttachmentDto): Promise<{
        id: string;
        fileUrl: string;
        fileName: string | null;
        attachmentType: string | null;
        fieldReportId: string;
        uploadedAt: Date;
    }>;
    removeAttachment(user: AuthenticatedUser, attachmentId: string): Promise<{
        message: string;
    }>;
}
