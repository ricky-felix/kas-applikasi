import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
export declare class ProjectsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(user: AuthenticatedUser, orgId?: string): Promise<{
        id: string;
        organizationId: string;
        description: string | null;
        title: string;
        clientName: string;
        clientEmail: string | null;
        clientPhone: string | null;
        location: string;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        startDate: Date | null;
        endDate: Date | null;
        plannedBudget: import("@prisma/client/runtime/library").Decimal | null;
        actualBudget: import("@prisma/client/runtime/library").Decimal | null;
        projectManagerId: string | null;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
        fieldReports: {
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
        }[];
        teamAssignments: ({
            team: {
                id: string;
                name: string;
                organizationId: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                teamLeadId: string | null;
            } | null;
            worker: {
                id: string;
                role: import(".prisma/client").$Enums.UserRole;
            } | null;
        } & {
            id: string;
            role: string | null;
            createdAt: Date;
            workerId: string | null;
            projectId: string;
            teamId: string | null;
            assignedDate: Date;
            expectedEndDate: Date | null;
            actualEndDate: Date | null;
        })[];
        projectMaterials: ({
            material: {
                id: string;
                name: string;
                organizationId: string;
                description: string | null;
                status: import(".prisma/client").$Enums.MaterialStatus;
                createdAt: Date;
                updatedAt: Date;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                sku: string | null;
                unit: string;
                quantityOnHand: import("@prisma/client/runtime/library").Decimal;
                reorderLevel: import("@prisma/client/runtime/library").Decimal | null;
                supplierName: string | null;
                supplierPhone: string | null;
            };
        } & {
            id: string;
            projectId: string;
            materialId: string;
            quantityPlanned: import("@prisma/client/runtime/library").Decimal;
            quantityUsed: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
            deliveryDate: Date | null;
            addedAt: Date;
        })[];
    } & {
        id: string;
        organizationId: string;
        description: string | null;
        title: string;
        clientName: string;
        clientEmail: string | null;
        clientPhone: string | null;
        location: string;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        startDate: Date | null;
        endDate: Date | null;
        plannedBudget: import("@prisma/client/runtime/library").Decimal | null;
        actualBudget: import("@prisma/client/runtime/library").Decimal | null;
        projectManagerId: string | null;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(user: AuthenticatedUser, dto: CreateProjectDto, orgId: string): Promise<{
        id: string;
        organizationId: string;
        description: string | null;
        title: string;
        clientName: string;
        clientEmail: string | null;
        clientPhone: string | null;
        location: string;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        startDate: Date | null;
        endDate: Date | null;
        plannedBudget: import("@prisma/client/runtime/library").Decimal | null;
        actualBudget: import("@prisma/client/runtime/library").Decimal | null;
        projectManagerId: string | null;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateProjectDto): Promise<{
        id: string;
        organizationId: string;
        description: string | null;
        title: string;
        clientName: string;
        clientEmail: string | null;
        clientPhone: string | null;
        location: string;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        startDate: Date | null;
        endDate: Date | null;
        plannedBudget: import("@prisma/client/runtime/library").Decimal | null;
        actualBudget: import("@prisma/client/runtime/library").Decimal | null;
        projectManagerId: string | null;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
    private findProjectOrThrow;
    private assertCanRead;
}
