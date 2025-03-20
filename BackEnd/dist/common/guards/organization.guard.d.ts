import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrganizationsService } from '../../modules/organizations/services/organizations.service';
export declare class OrganizationGuard implements CanActivate {
    private readonly reflector;
    private readonly organizationService;
    constructor(reflector: Reflector, organizationService: OrganizationsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private isSubscriptionValid;
    private checkOrganizationLimits;
    private getRequestedFeature;
    private hasFeatureAccess;
    private getTierFeatures;
}
