import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
export declare class TeamsController {
    private readonly teamsService;
    constructor(teamsService: TeamsService);
    findAll(user: AuthenticatedUser, orgId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        members: {
            id: string;
            role: string | null;
            workerId: string;
            teamId: string;
            joinedAt: Date;
        }[];
    } & {
        id: string;
        name: string;
        organizationId: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        teamLeadId: string | null;
    })[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
        members: ({
            worker: {
                id: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            role: string | null;
            workerId: string;
            teamId: string;
            joinedAt: Date;
        })[];
    } & {
        id: string;
        name: string;
        organizationId: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        teamLeadId: string | null;
    }>;
    create(user: AuthenticatedUser, dto: CreateTeamDto, orgId?: string): Promise<{
        id: string;
        name: string;
        organizationId: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        teamLeadId: string | null;
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateTeamDto): Promise<{
        id: string;
        name: string;
        organizationId: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        teamLeadId: string | null;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
    addMember(user: AuthenticatedUser, teamId: string, dto: AddTeamMemberDto): Promise<{
        id: string;
        role: string | null;
        workerId: string;
        teamId: string;
        joinedAt: Date;
    }>;
    removeMember(user: AuthenticatedUser, teamId: string, workerId: string): Promise<{
        message: string;
    }>;
}
