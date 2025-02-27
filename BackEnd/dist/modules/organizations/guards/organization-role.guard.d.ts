import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export type OrganizationRole = 'owner' | 'admin' | 'member' | 'viewer';
export interface RoleMetadata {
    roles: OrganizationRole[];
    allowSelf?: boolean;
    checkResourceOwner?: boolean;
}
export declare class OrganizationRoleGuard implements CanActivate {
    private reflector;
    private readonly logger;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTargetUserId;
    private checkResourceOwnership;
}
export declare const RequireOrganizationRoles: (metadata: RoleMetadata) => MethodDecorator;
