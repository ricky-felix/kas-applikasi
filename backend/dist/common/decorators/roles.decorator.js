"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalRoles = exports.GLOBAL_ROLES_KEY = exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
exports.GLOBAL_ROLES_KEY = 'globalRoles';
const GlobalRoles = (...roles) => (0, common_1.SetMetadata)(exports.GLOBAL_ROLES_KEY, roles);
exports.GlobalRoles = GlobalRoles;
//# sourceMappingURL=roles.decorator.js.map