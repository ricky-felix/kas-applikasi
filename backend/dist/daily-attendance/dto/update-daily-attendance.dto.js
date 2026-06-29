"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDailyAttendanceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_daily_attendance_dto_1 = require("./create-daily-attendance.dto");
class UpdateDailyAttendanceDto extends (0, swagger_1.PartialType)(create_daily_attendance_dto_1.CreateDailyAttendanceDto) {
}
exports.UpdateDailyAttendanceDto = UpdateDailyAttendanceDto;
//# sourceMappingURL=update-daily-attendance.dto.js.map