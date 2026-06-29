"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerRegistrationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const worker_registrations_service_1 = require("./worker-registrations.service");
const create_worker_registration_dto_1 = require("./dto/create-worker-registration.dto");
const update_worker_registration_dto_1 = require("./dto/update-worker-registration.dto");
const approve_worker_registration_dto_1 = require("./dto/approve-worker-registration.dto");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let WorkerRegistrationsController = class WorkerRegistrationsController {
    constructor(service) {
        this.service = service;
    }
    findAll(user, orgId) {
        return this.service.findAll(user, orgId);
    }
    findOne(user, id) {
        return this.service.findOne(user, id);
    }
    create(user, dto, orgId) {
        return this.service.create(user, dto, orgId ?? '');
    }
    approve(user, id, dto) {
        return this.service.approve(user, id, dto);
    }
    update(user, id, dto) {
        return this.service.update(user, id, dto);
    }
    remove(user, id) {
        return this.service.remove(user, id);
    }
};
exports.WorkerRegistrationsController = WorkerRegistrationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List worker registration requests' }),
    (0, swagger_1.ApiQuery)({ name: 'organizationId', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkerRegistrationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkerRegistrationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiQuery)({ name: 'organizationId', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_worker_registration_dto_1.CreateWorkerRegistrationDto, String]),
    __metadata("design:returntype", void 0)
], WorkerRegistrationsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve registration and create field_worker record (transactional)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, approve_worker_registration_dto_1.ApproveWorkerRegistrationDto]),
    __metadata("design:returntype", void 0)
], WorkerRegistrationsController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_worker_registration_dto_1.UpdateWorkerRegistrationDto]),
    __metadata("design:returntype", void 0)
], WorkerRegistrationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkerRegistrationsController.prototype, "remove", null);
exports.WorkerRegistrationsController = WorkerRegistrationsController = __decorate([
    (0, swagger_1.ApiTags)('worker-registrations'),
    (0, swagger_1.ApiBearerAuth)('supabase-jwt'),
    (0, common_1.Controller)('worker-registrations'),
    __metadata("design:paramtypes", [worker_registrations_service_1.WorkerRegistrationsService])
], WorkerRegistrationsController);
//# sourceMappingURL=worker-registrations.controller.js.map