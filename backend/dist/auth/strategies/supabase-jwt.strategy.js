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
var SupabaseJwtStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseJwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const jose_1 = require("jose");
const passport = require("passport");
const STRATEGY_NAME = 'supabase-jwt';
class SupabaseJwtPassportStrategy extends passport.Strategy {
    constructor(prisma, jwksUri, issuer) {
        super();
        this.prisma = prisma;
        this.name = STRATEGY_NAME;
        this.logger = new common_1.Logger(SupabaseJwtPassportStrategy.name);
        this.audience = 'authenticated';
        this.issuer = issuer;
        this.jwks = (0, jose_1.createRemoteJWKSet)(new URL(jwksUri), {
            cacheMaxAge: 10 * 60 * 1000,
        });
        this.logger.log(`JWKS URI : ${jwksUri}`);
        this.logger.log(`Issuer   : ${issuer}`);
        this.logger.log(`Audience : ${this.audience}`);
    }
    async authenticate(req) {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            this.fail({ message: 'Missing or malformed Authorization header' });
            return;
        }
        const token = authHeader.slice(7);
        try {
            const { payload } = await (0, jose_1.jwtVerify)(token, this.jwks, {
                algorithms: ['RS256', 'ES256'],
                issuer: this.issuer,
                audience: this.audience,
            });
            const user = await this.buildAuthenticatedUser(payload);
            this.success(user, undefined);
        }
        catch (err) {
            this.logger.debug(`JWT verification failed: ${err.message}`);
            this.fail({ message: 'Invalid or expired token' });
        }
    }
    async buildAuthenticatedUser(payload) {
        const userId = payload.sub;
        if (!userId) {
            throw new common_1.UnauthorizedException('Invalid token: missing sub');
        }
        const dbUser = await this.prisma.user.findUnique({
            where: { id: userId },
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
            this.logger.warn(`User ${userId} not found in public.users — returning minimal auth`);
            return {
                id: userId,
                globalRole: null,
                organizations: [],
            };
        }
        return {
            id: dbUser.id,
            globalRole: dbUser.role,
            organizations: dbUser.organizationMemberships.map((m) => ({
                organizationId: m.organizationId,
                role: m.role,
            })),
        };
    }
}
let SupabaseJwtStrategy = SupabaseJwtStrategy_1 = class SupabaseJwtStrategy {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(SupabaseJwtStrategy_1.name);
    }
    onModuleInit() {
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const explicitJwksUri = this.configService.get('SUPABASE_JWKS_URI');
        if (!explicitJwksUri && !supabaseUrl) {
            throw new Error('Either SUPABASE_JWKS_URI or SUPABASE_URL env var must be set for JWT verification.');
        }
        const normalizedUrl = supabaseUrl?.replace(/\/$/, '');
        const jwksUri = explicitJwksUri ?? `${normalizedUrl}/auth/v1/.well-known/jwks.json`;
        const issuer = normalizedUrl
            ? `${normalizedUrl}/auth/v1`
            : jwksUri.replace(/\/\.well-known\/jwks\.json$/, '');
        const strategy = new SupabaseJwtPassportStrategy(this.prisma, jwksUri, issuer);
        passport.use(STRATEGY_NAME, strategy);
        this.logger.log(`Registered passport strategy "${STRATEGY_NAME}" (JWKS / asymmetric)`);
    }
};
exports.SupabaseJwtStrategy = SupabaseJwtStrategy;
exports.SupabaseJwtStrategy = SupabaseJwtStrategy = SupabaseJwtStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], SupabaseJwtStrategy);
//# sourceMappingURL=supabase-jwt.strategy.js.map