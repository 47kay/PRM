import { 
    Injectable, 
    ExecutionContext, 
    UnauthorizedException,
    Logger,
    CanActivate,
    SetMetadata
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { JwtService } from '@nestjs/jwt';
  import { Request } from 'express';
  import { UsersService } from '../../users/services/users.service';
  import { UserSessionsService } from '../../users/services/user-sessions.service';
  import { ConfigService } from '@nestjs/config';
  import { User } from '../../users/entities/user.entity';
  
  interface JwtPayload {
    sub: string;
    email: string;
    [key: string]: any;
  }
  
  interface AuthenticatedRequest extends Request {
    user: User;
    token: {
      raw: string;
      payload: JwtPayload;
    };
    session?: any;
  }
  
  export const IS_PUBLIC_KEY = 'isPublic';
  export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    private readonly logger = new Logger(AuthGuard.name);
  
    constructor(
      private readonly reflector: Reflector,
      private readonly jwtService: JwtService,
      private readonly usersService: UsersService,
      private readonly userSessionsService: UserSessionsService,
      private readonly configService: ConfigService,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      try {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        
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
          const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
            secret: this.configService.get<string>('JWT_SECRET')
          });
  
          const enableSessionTracking = this.configService.get<boolean>('ENABLE_SESSION_TRACKING');
          if (enableSessionTracking) {
            const session = await this.userSessionsService.validateSession(token);
            if (!session) {
              throw new UnauthorizedException('Invalid or expired session');
            }
            request.session = session;
          }
  
          // Fetch and validate user
          const userData = await this.getUserData(payload.sub);
          if (!userData) {
            throw new UnauthorizedException('User not found');
          }
  
          if (!userData.isActive) {
            throw new UnauthorizedException('User account is inactive');
          }
  
          if (userData.requirePasswordChange) {
            const isPasswordChangeRoute = request.path.includes('/auth/change-password');
            if (!isPasswordChangeRoute) {
              throw new UnauthorizedException('Password change required');
            }
          }
  
          request.user = userData;
          request.token = {
            raw: token,
            payload
          };
  
          if (request.session) {
            // Handle session activity update
            this.updateSessionActivity(request.session.id).catch(error => {
              this.logger.error('Error updating session activity:', error);
            });
          }
  
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
  
    private async getUserData(userId: string): Promise<User | null> {
      try {
        return await this.usersService.findById(
          userId,
          ['roles', 'permissions', 'preferences']
        );
      } catch (error) {
        this.logger.error(`Error fetching user data: ${error.message}`);
        throw new UnauthorizedException('Error fetching user data');
      }
    }
  
    private async updateSessionActivity(sessionId: string): Promise<void> {
      await this.userSessionsService.updateLastActivity(sessionId);
    }
  
    private extractTokenFromHeader(request: Request): string | undefined {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        return undefined;
      }
  
      const [type, token] = authHeader.split(' ');
      if (type !== 'Bearer') {
        return undefined;
      }
  
      return token;
    }
  }