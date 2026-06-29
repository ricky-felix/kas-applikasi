"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const material_requests_controller_1 = require("./material-requests.controller");
const material_requests_service_1 = require("./material-requests.service");
let MaterialRequestsModule = class MaterialRequestsModule {
};
exports.MaterialRequestsModule = MaterialRequestsModule;
exports.MaterialRequestsModule = MaterialRequestsModule = __decorate([
    (0, common_1.Module)({ controllers: [material_requests_controller_1.MaterialRequestsController], providers: [material_requests_service_1.MaterialRequestsService] })
], MaterialRequestsModule);
//# sourceMappingURL=material-requests.module.js.map