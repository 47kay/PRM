import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrganizationsService } from '../services/organizations.service';
export declare class OrganizationGuard implements CanActivate {
    private readonly reflector;
    private readonly organizationsService;
    private readonly logger;
    constructor(reflector: Reflector, organizationsService: OrganizationsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractOrganizationId;
    private extractFromPath;
    private verifyOrganizationAccess;
}
export declare const OptionalOrganization: () => (target: any, key?: string, descriptor?: PropertyDescriptor) => PropertyDescriptor;
