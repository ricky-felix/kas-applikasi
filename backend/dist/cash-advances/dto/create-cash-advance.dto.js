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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCashAdvanceDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateCashAdvanceDto {
}
exports.CreateCashAdvanceDto = CreateCashAdvanceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Worker user ID (defaults to current user)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCashAdvanceDto.prototype, "workerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCashAdvanceDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCashAdvanceDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-06-01' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCashAdvanceDto.prototype, "advanceDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.CashAdvanceStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CashAdvanceStatus),
    __metadata("design:type", String)
], CreateCashAdvanceDto.prototype, "status", void 0);
//# sourceMappingURL=create-cash-advance.dto.js.map