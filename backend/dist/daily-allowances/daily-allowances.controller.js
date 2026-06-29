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
exports.DailyAllowancesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const daily_allowances_service_1 = require("./daily-allowances.service");
const create_daily_allowance_dto_1 = require("./dto/create-daily-allowance.dto");
const update_daily_allowance_dto_1 = require("./dto/update-daily-allowance.dto");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let DailyAllowancesController = class DailyAllowancesController {
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
    update(user, id, dto) {
        return this.service.update(user, id, dto);
    }
    remove(user, id) {
        return this.service.remove(user, id);
    }
};
exports.DailyAllowancesController = DailyAllowancesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List daily allowances (workers see own; admins see org)' }),
    (0, swagger_1.ApiQuery)({ name: 'organizationId', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DailyAllowancesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DailyAllowancesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiQuery)({ name: 'organizationId', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_daily_allowance_dto_1.CreateDailyAllowanceDto, String]),
    __metadata("design:returntype", void 0)
], DailyAllowancesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_daily_allowance_dto_1.UpdateDailyAllowanceDto]),
    __metadata("design:returntype", void 0)
], DailyAllowancesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DailyAllowancesController.prototype, "remove", null);
exports.DailyAllowancesController = DailyAllowancesController = __decorate([
    (0, swagger_1.ApiTags)('daily-allowances'),
    (0, swagger_1.ApiBearerAuth)('supabase-jwt'),
    (0, common_1.Controller)('daily-allowances'),
    __metadata("design:paramtypes", [daily_allowances_service_1.DailyAllowancesService])
], DailyAllowancesController);
//# sourceMappingURL=daily-allowances.controller.js.map