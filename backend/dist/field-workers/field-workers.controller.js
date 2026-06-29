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
exports.FieldWorkersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const field_workers_service_1 = require("./field-workers.service");
const create_field_worker_dto_1 = require("./dto/create-field-worker.dto");
const update_field_worker_dto_1 = require("./dto/update-field-worker.dto");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let FieldWorkersController = class FieldWorkersController {
    constructor(fieldWorkersService) {
        this.fieldWorkersService = fieldWorkersService;
    }
    findWithProfile(user, orgId) {
        return this.fieldWorkersService.findAll(user, orgId);
    }
    findAll(user, orgId) {
        return this.fieldWorkersService.findAll(user, orgId);
    }
    findOne(user, id) {
        return this.fieldWorkersService.findOne(user, id);
    }
    create(user, dto, orgId) {
        return this.fieldWorkersService.create(user, dto, orgId ?? '');
    }
    update(user, id, dto) {
        return this.fieldWorkersService.update(user, id, dto);
    }
    remove(user, id) {
        return this.fieldWorkersService.remove(user, id);
    }
};
exports.FieldWorkersController = FieldWorkersController;
__decorate([
    (0, common_1.Get)('with-profile'),
    (0, swagger_1.ApiOperation)({ summary: 'List field workers with user profile (name, email, phone)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FieldWorkersController.prototype, "findWithProfile", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiQuery)({ name: 'organizationId', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FieldWorkersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FieldWorkersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiQuery)({ name: 'organizationId', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_field_worker_dto_1.CreateFieldWorkerDto, String]),
    __metadata("design:returntype", void 0)
], FieldWorkersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_field_worker_dto_1.UpdateFieldWorkerDto]),
    __metadata("design:returntype", void 0)
], FieldWorkersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FieldWorkersController.prototype, "remove", null);
exports.FieldWorkersController = FieldWorkersController = __decorate([
    (0, swagger_1.ApiTags)('field-workers'),
    (0, swagger_1.ApiBearerAuth)('supabase-jwt'),
    (0, common_1.Controller)('field-workers'),
    __metadata("design:paramtypes", [field_workers_service_1.FieldWorkersService])
], FieldWorkersController);
//# sourceMappingURL=field-workers.controller.js.map