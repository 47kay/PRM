// src/modules/auth/guards/jwt-auth.guard.ts

import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtAuthGuard.name);

    constructor(
        private reflector: Reflector,
        private authService: AuthService,
    ) {
        super();
    }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        // Check if the endpoint is marked as public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        // If there's an error or no user, throw an error
        if (err || !user) {
            this.logger.warn(`Authentication failed: ${err?.message || 'No user found'}`);
            throw new UnauthorizedException(
                err?.message || 'Invalid or expired token',
            );
        }

        // Check if token is blacklisted
        if (token && this.authService.isTokenBlacklisted(token)) {
            this.logger.warn(`Blacklisted token used for user ${user.id}`);
            throw new UnauthorizedException('Token has been revoked');
        }

        // Check if user is active
        if (!user.isActive) {
            this.logger.warn(`Inactive user ${user.id} attempted to access the system`);
            throw new UnauthorizedException('User account is inactive');
        }

        // Check if user's email is verified (if required)
        if (this.authService.requireEmailVerification && !user.emailVerified) {
            this.logger.warn(`Unverified user ${user.id} attempted to access the system`);
            throw new UnauthorizedException('Email verification required');
        }

        // Add token metadata to request
        request.tokenMetadata = {
            token,
            iat: user.iat,
            exp: user.exp,
        };

        // Log successful authentication
        this.logger.debug(`User ${user.id} successfully authenticated`);

        return user;
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}