import { ExecutionContext, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { UserSessionsService } from '../../users/services/user-sessions.service';
import { ConfigService } from '@nestjs/config';
export declare const IS_PUBLIC_KEY = "isPublic";
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
export declare class AuthGuard implements CanActivate {
    private readonly reflector;
    private readonly jwtService;
    private readonly usersService;
    private readonly userSessionsService;
    private readonly configService;
    private readonly logger;
    constructor(reflector: Reflector, jwtService: JwtService, usersService: UsersService, userSessionsService: UserSessionsService, configService: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private getUserData;
    private updateSessionActivity;
    private extractTokenFromHeader;
}
