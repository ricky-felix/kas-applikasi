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
var JwtAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const prisma_service_1 = require("../../prisma/prisma.service");
let JwtAuthGuard = JwtAuthGuard_1 = class JwtAuthGuard extends (0, passport_1.AuthGuard)('supabase-jwt') {
    constructor(reflector, configService, prisma) {
        super();
        this.reflector = reflector;
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(JwtAuthGuard_1.name);
        this.devMode = this.configService.get('AUTH_DEV_MODE') === 'true';
        this.devUserId = this.configService.get('DEV_USER_ID');
        if (this.devMode) {
            this.logger.warn('================================================================');
            this.logger.warn('  AUTH DEV MODE IS ACTIVE — JWKS verification is DISABLED.      ');
            this.logger.warn(`  All protected requests will be authenticated as DEV_USER_ID:   `);
            this.logger.warn(`  ${this.devUserId}`);
            this.logger.warn('  Set AUTH_DEV_MODE=false (or remove it) before deploying.       ');
            this.logger.warn('================================================================');
        }
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        if (this.devMode) {
            return this.activateDevMode(context);
        }
        return super.canActivate(context);
    }
    async activateDevMode(context) {
        if (!this.devUserId) {
            this.logger.error('AUTH_DEV_MODE is true but DEV_USER_ID is not set — request denied.');
            return false;
        }
        const dbUser = await this.prisma.user.findUnique({
            where: { id: this.devUserId },
            select: {
                id: true,
                role: true,
                organizationMemberships: {
                    select: {
                        organizationId: true,
                        role: true,
                    },
                },
            },
        });
        if (!dbUser) {
            this.logger.error(`DEV_USER_ID "${this.devUserId}" not found in public.users — request denied.`);
            return false;
        }
        const user = {
            id: dbUser.id,
            globalRole: dbUser.role,
            organizations: dbUser.organizationMemberships.map((m) => ({
                organizationId: m.organizationId,
                role: m.role,
            })),
        };
        const request = context.switchToHttp().getRequest();
        request.user = user;
        return true;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = JwtAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map