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
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const roles_decorator_1 = require("../decorators/roles.decorator");
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const requiredGlobalRoles = this.reflector.getAllAndOverride(roles_decorator_1.GLOBAL_ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles && !requiredGlobalRoles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('No authenticated user');
        }
        if (user.globalRole === 'super_admin') {
            return true;
        }
        if (requiredGlobalRoles && requiredGlobalRoles.length > 0) {
            if (!requiredGlobalRoles.includes(user.globalRole ?? '')) {
                throw new common_1.ForbiddenException('Insufficient global role');
            }
        }
        if (requiredRoles && requiredRoles.length > 0) {
            const orgId = request.params?.organizationId ?? request.body?.organizationId;
            if (!orgId)
                return true;
            const membership = user.organizations.find((o) => o.organizationId === orgId);
            if (!membership) {
                throw new common_1.ForbiddenException('Not a member of this organization');
            }
            if (!requiredRoles.includes(membership.role)) {
                throw new common_1.ForbiddenException('Insufficient organization role');
            }
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map