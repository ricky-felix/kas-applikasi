"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectAssignmentsModule = void 0;
const common_1 = require("@nestjs/common");
const project_assignments_controller_1 = require("./project-assignments.controller");
const project_assignments_service_1 = require("./project-assignments.service");
let ProjectAssignmentsModule = class ProjectAssignmentsModule {
};
exports.ProjectAssignmentsModule = ProjectAssignmentsModule;
exports.ProjectAssignmentsModule = ProjectAssignmentsModule = __decorate([
    (0, common_1.Module)({ controllers: [project_assignments_controller_1.ProjectAssignmentsController], providers: [project_assignments_service_1.ProjectAssignmentsService] })
], ProjectAssignmentsModule);
//# sourceMappingURL=project-assignments.module.js.map