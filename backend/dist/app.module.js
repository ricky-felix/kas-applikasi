"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
const projects_module_1 = require("./projects/projects.module");
const materials_module_1 = require("./materials/materials.module");
const teams_module_1 = require("./teams/teams.module");
const field_workers_module_1 = require("./field-workers/field-workers.module");
const project_assignments_module_1 = require("./project-assignments/project-assignments.module");
const project_materials_module_1 = require("./project-materials/project-materials.module");
const field_reports_module_1 = require("./field-reports/field-reports.module");
const requests_module_1 = require("./requests/requests.module");
const invoices_module_1 = require("./invoices/invoices.module");
const cash_flows_module_1 = require("./cash-flows/cash-flows.module");
const daily_attendance_module_1 = require("./daily-attendance/daily-attendance.module");
const analytics_module_1 = require("./analytics/analytics.module");
const change_orders_module_1 = require("./change-orders/change-orders.module");
const material_requests_module_1 = require("./material-requests/material-requests.module");
const proof_submissions_module_1 = require("./proof-submissions/proof-submissions.module");
const cash_advances_module_1 = require("./cash-advances/cash-advances.module");
const daily_allowances_module_1 = require("./daily-allowances/daily-allowances.module");
const worker_registrations_module_1 = require("./worker-registrations/worker-registrations.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            projects_module_1.ProjectsModule,
            materials_module_1.MaterialsModule,
            teams_module_1.TeamsModule,
            field_workers_module_1.FieldWorkersModule,
            project_assignments_module_1.ProjectAssignmentsModule,
            project_materials_module_1.ProjectMaterialsModule,
            field_reports_module_1.FieldReportsModule,
            requests_module_1.RequestsModule,
            invoices_module_1.InvoicesModule,
            cash_flows_module_1.CashFlowsModule,
            daily_attendance_module_1.DailyAttendanceModule,
            analytics_module_1.AnalyticsModule,
            change_orders_module_1.ChangeOrdersModule,
            material_requests_module_1.MaterialRequestsModule,
            proof_submissions_module_1.ProofSubmissionsModule,
            cash_advances_module_1.CashAdvancesModule,
            daily_allowances_module_1.DailyAllowancesModule,
            worker_registrations_module_1.WorkerRegistrationsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map