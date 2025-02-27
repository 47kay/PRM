// src/interfaces/request.interface.ts

import { Request } from '@nestjs/common';
import { User } from '../modules/users/entities/user.entity';
import { Organization } from '../modules/organizations/entities/organization.entity';
import { Role } from '../modules/users/enums/role.enum';

export interface RequestUser extends User {
    permissions: string[];
    deviceId?: string;
    sessionId: string;
}

export interface RequestOrganization extends Organization {
    subscription: {
        plan: string;
        status: string;
        expiresAt: Date;
    };
    features: string[];
}

export interface CustomRequest extends Request {
    user?: RequestUser;
    organization?: RequestOrganization;
    deviceId?: string;
    sessionId?: string;
    correlationId?: string;
    startTime?: number;
}

// Additional request interfaces for specific features
export interface AuthenticatedRequest extends CustomRequest {
    user: RequestUser;  // Make user required for authenticated requests
}

export interface OrganizationRequest extends AuthenticatedRequest {
    organization: RequestOrganization;  // Make organization required
}

// Request context interface for logging and tracking
export interface RequestContext {
    id: string;
    path: string;
    method: string;
    userId?: string;
    organizationId?: string;
    ip: string;
    userAgent: string;
    correlationId: string;
    startTime: number;
}

// Request validation interfaces
export interface RequestValidation {
    hasPermission: (permission: string) => boolean;
    hasRole: (role: Role | Role[]) => boolean;
    isOrganizationMember: () => boolean;
    isResourceOwner: (resourceUserId: string) => boolean;
}

// Rate limiting interface
export interface RateLimitInfo {
    limit: number;
    current: number;
    remaining: number;
    resetTime: Date;
}

// Example middleware interfaces
export interface AuthMiddlewareOptions {
    requireOrganization?: boolean;
    roles?: Role[];
    permissions?: string[];
}

// Example usage of interfaces:
/*
// Middleware function using CustomRequest
export function authMiddleware(
    options: AuthMiddlewareOptions = {}
): RequestHandler {
    return async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            // Add user to request
            const token = extractTokenFromHeader(req);
            const decodedToken = verifyToken(token);
            
            req.user = await getUserFromToken(decodedToken);
            req.deviceId = decodedToken.deviceId;
            req.sessionId = decodedToken.sessionId;
            
            // Check roles if specified
            if (options.roles && !options.roles.includes(req.user.role)) {
                throw new ForbiddenException('Insufficient role');
            }

            // Add organization if required
            if (options.requireOrganization) {
                req.organization = await getOrganization(req.user.organizationId);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

// Controller using typed request
@Controller('users')
export class UsersController {
    @Get('profile')
    async getProfile(@Req() req: AuthenticatedRequest) {
        return req.user;
    }

    @Get('organization')
    async getOrganization(@Req() req: OrganizationRequest) {
        return req.organization;
    }
}
*/