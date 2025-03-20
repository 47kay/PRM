// src/modules/auth/guards/auth.guard.ts

import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class AuthGuard {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        if (isPublic) return true;
        throw new UnauthorizedException('No authentication token provided');
      }

      try {
        // Verify and decode the token using JwtService directly
        const payload = this.jwtService.verify(token, {
          secret: this.configService.get<string>('JWT_SECRET')
        });
        
        // Check if token is blacklisted using existing method
        if (this.authService.isTokenBlacklisted(token)) {
          throw new UnauthorizedException('Token has been revoked');
        }

        // Fetch user data using existing UsersService
        const user = await this.usersService.findById(payload.sub);
        if (!user) {
          throw new UnauthorizedException('User not found');
        }

        // Check if user is active
        if (!user.isActive) {
          throw new UnauthorizedException('User account is inactive');
        }

        // Check if email verification is required
        if (this.authService.requireEmailVerification && !user.isEmailVerified) {
          throw new UnauthorizedException('Email verification required');
        }

        // Attach user and token info to request for controllers to use
        request.user = user;
        request.tokenMetadata = {
          token,
          iat: payload.iat,
          exp: payload.exp,
        };

        return true;
      } catch (error) {
        if (isPublic) return true;
        
        this.logger.error('Token validation failed:', error);
        
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token has expired');
        }
        if (error.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Invalid token');
        }
        throw error;
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('Authentication error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}