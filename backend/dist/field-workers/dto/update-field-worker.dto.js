"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFieldWorkerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_field_worker_dto_1 = require("./create-field-worker.dto");
class UpdateFieldWorkerDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(create_field_worker_dto_1.CreateFieldWorkerDto, ['id'])) {
}
exports.UpdateFieldWorkerDto = UpdateFieldWorkerDto;
//# sourceMappingURL=update-field-worker.dto.js.map