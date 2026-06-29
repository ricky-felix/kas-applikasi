import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Observable } from 'rxjs';
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    private readonly reflector;
    private readonly configService;
    private readonly prisma;
    private readonly logger;
    private readonly devMode;
    private readonly devUserId;
    constructor(reflector: Reflector, configService: ConfigService, prisma: PrismaService);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
    private activateDevMode;
}
export {};
