import { ProjectAssignmentsService } from './project-assignments.service';
import { CreateProjectAssignmentDto } from './dto/create-project-assignment.dto';
import { UpdateProjectAssignmentDto } from './dto/update-project-assignment.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
export declare class ProjectAssignmentsController {
    private readonly service;
    constructor(service: ProjectAssignmentsService);
    findAll(user: AuthenticatedUser, projectId?: string, workerId?: string): Promise<({
        project: {
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
        };
        team: {
            id: string;
            name: string;
            organizationId: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            teamLeadId: string | null;
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
    })[]> | Promise<({
        worker: {
            email: string | null;
            id: string;
            name: string | null;
            phone: string | null;
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
    })[]>;
    create(user: AuthenticatedUser, dto: CreateProjectAssignmentDto): Promise<{
        id: string;
        role: string | null;
        createdAt: Date;
        workerId: string | null;
        projectId: string;
        teamId: string | null;
        assignedDate: Date;
        expectedEndDate: Date | null;
        actualEndDate: Date | null;
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateProjectAssignmentDto): Promise<{
        id: string;
        role: string | null;
        createdAt: Date;
        workerId: string | null;
        projectId: string;
        teamId: string | null;
        assignedDate: Date;
        expectedEndDate: Date | null;
        actualEndDate: Date | null;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
}
