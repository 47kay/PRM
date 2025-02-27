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
export interface AuthenticatedRequest extends CustomRequest {
    user: RequestUser;
}
export interface OrganizationRequest extends AuthenticatedRequest {
    organization: RequestOrganization;
}
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
export interface RequestValidation {
    hasPermission: (permission: string) => boolean;
    hasRole: (role: Role | Role[]) => boolean;
    isOrganizationMember: () => boolean;
    isResourceOwner: (resourceUserId: string) => boolean;
}
export interface RateLimitInfo {
    limit: number;
    current: number;
    remaining: number;
    resetTime: Date;
}
export interface AuthMiddlewareOptions {
    requireOrganization?: boolean;
    roles?: Role[];
    permissions?: string[];
}
