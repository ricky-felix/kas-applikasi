import { AnalyticsService } from './analytics.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
export declare class AnalyticsController {
    private readonly service;
    constructor(service: AnalyticsService);
    getDashboard(user: AuthenticatedUser, orgId?: string): Promise<{
        projectsByStatus: {
            status: import(".prisma/client").$Enums.ProjectStatus;
            count: number;
        }[];
        totalPlannedBudget: number | import("@prisma/client/runtime/library").Decimal;
        totalActualBudget: number | import("@prisma/client/runtime/library").Decimal;
        activeProjectCount: number;
        avgProgressPercentage: number;
        workersOnSiteCount: number;
        outstandingInvoiceTotal: number;
    }>;
    getFinance(user: AuthenticatedUser, orgId?: string): Promise<{
        monthlyCashFlows: {
            month: string;
            type: string;
            total: number;
        }[];
        invoices: {
            paid: {
                count: number;
                total: number | import("@prisma/client/runtime/library").Decimal;
            };
            outstanding: {
                count: number;
                totalBilled: number | import("@prisma/client/runtime/library").Decimal;
                totalPaid: number | import("@prisma/client/runtime/library").Decimal;
                totalOwed: number;
            };
        };
        topExpenseCategories: {
            category: import(".prisma/client").$Enums.CashFlowCategory;
            total: number | import("@prisma/client/runtime/library").Decimal;
        }[];
    }>;
}
