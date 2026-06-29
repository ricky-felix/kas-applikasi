import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateDailyAttendanceDto } from './dto/create-daily-attendance.dto';
import { UpdateDailyAttendanceDto } from './dto/update-daily-attendance.dto';
export declare class DailyAttendanceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(user: AuthenticatedUser, projectId?: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        workerId: string;
        projectId: string;
        notes: string | null;
        attendanceDate: Date;
        checkInTime: string | null;
        checkOutTime: string | null;
        hoursWorked: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        workerId: string;
        projectId: string;
        notes: string | null;
        attendanceDate: Date;
        checkInTime: string | null;
        checkOutTime: string | null;
        hoursWorked: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    create(user: AuthenticatedUser, dto: CreateDailyAttendanceDto): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        workerId: string;
        projectId: string;
        notes: string | null;
        attendanceDate: Date;
        checkInTime: string | null;
        checkOutTime: string | null;
        hoursWorked: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateDailyAttendanceDto): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        workerId: string;
        projectId: string;
        notes: string | null;
        attendanceDate: Date;
        checkInTime: string | null;
        checkOutTime: string | null;
        hoursWorked: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        message: string;
    }>;
    private assertCanRead;
}
