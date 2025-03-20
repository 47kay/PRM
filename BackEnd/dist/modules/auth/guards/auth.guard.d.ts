import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/services/users.service';
export declare class AuthGuard {
    private readonly reflector;
    private readonly authService;
    private readonly jwtService;
    private readonly configService;
    private readonly usersService;
    private readonly logger;
    constructor(reflector: Reflector, authService: AuthService, jwtService: JwtService, configService: ConfigService, usersService: UsersService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
