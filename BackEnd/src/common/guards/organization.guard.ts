// src/common/guards/organization.guard.ts

import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { OrganizationService } from '../../modules/organizations/services/organizations.service';
import { AUTH_ORG_KEY } from '../decorators/auth.decorator';

@Injectable()
export class OrganizationGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly organizationService: OrganizationService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Check if organization check is required
        const requireOrganization = this.reflector.getAllAndOverride<boolean>(
            AUTH_ORG_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requireOrganization) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user as any;

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (!user.organizationId) {
            throw new ForbiddenException('User is not associated with any organization');
        }

        try {
            // Get organization details
            const organization = await this.organizationService.findById(user.organizationId);

            if (!organization) {
                throw new ForbiddenException('Organization not found');
            }

            // Check if organization is active
            if (!organization.isActive) {
                throw new ForbiddenException('Organization is inactive');
            }

            // Check subscription status
            if (!this.isSubscriptionValid(organization)) {
                throw new ForbiddenException('Organization subscription is invalid or expired');
            }

            // Check organization limits
            await this.checkOrganizationLimits(organization, request);

            // Add organization to request for use in controllers
            request['organization'] = organization;

            return true;
        } catch (error) {
            if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new ForbiddenException('Organization access denied');
        }
    }

    private isSubscriptionValid(organization: any): boolean {
        const now = new Date();
        const subscriptionEnd = new Date(organization.subscriptionEndDate);

        // Check if subscription is active and not expired
        if (!organization.subscriptionStatus || organization.subscriptionStatus !== 'ACTIVE') {
            return false;
        }

        // Check if subscription end date is valid
        if (!subscriptionEnd || subscriptionEnd < now) {
            return false;
        }

        return true;
    }

    private async checkOrganizationLimits(organization: any, request: Request): Promise<void> {
        // Get plan limits
        const planLimits = await this.organizationService.getPlanLimits(organization.subscriptionPlan);

        // Check user limit
        if (planLimits.maxUsers) {
            const userCount = await this.organizationService.getUserCount(organization.id);
            if (userCount >= planLimits.maxUsers) {
                throw new ForbiddenException('Organization user limit reached');
            }
        }

        // Check storage limit
        if (planLimits.maxStorage && request.url.includes('/storage')) {
            const storageUsed = await this.organizationService.getStorageUsed(organization.id);
            if (storageUsed >= planLimits.maxStorage) {
                throw new ForbiddenException('Organization storage limit reached');
            }
        }

        // Check API rate limits
        if (planLimits.maxRequestsPerMinute) {
            const requestCount = await this.organizationService.getRequestCount(
                organization.id,
                'MINUTE',
            );
            if (requestCount >= planLimits.maxRequestsPerMinute) {
                throw new ForbiddenException('API rate limit exceeded');
            }
        }

        // Check feature access
        const requestedFeature = this.getRequestedFeature(request);
        if (requestedFeature && !this.hasFeatureAccess(organization, requestedFeature)) {
            throw new ForbiddenException(`Access to ${requestedFeature} feature is not included in your plan`);
        }
    }

    private getRequestedFeature(request: Request): string | null {
        // Map endpoints to features
        const featureMap: Record<string, string> = {
            '/api/messages/whatsapp': 'WHATSAPP_INTEGRATION',
            '/api/analytics': 'ADVANCED_ANALYTICS',
            '/api/export': 'DATA_EXPORT',
            // Add more feature mappings
        };

        for (const [endpoint, feature] of Object.entries(featureMap)) {
            if (request.url.includes(endpoint)) {
                return feature;
            }
        }

        return null;
    }

    private hasFeatureAccess(organization: any, feature: string): boolean {
        // Check if the feature is included in the organization's subscription plan
        return organization.features?.includes(feature) || false;
    }
}

// Example usage in a controller:
/*
@Controller('api/patients')
@UseGuards(JwtAuthGuard, OrganizationGuard)
export class PatientsController {
    @Get()
    async findAll() {
        // Only accessible by users with valid organization access
    }
}

// Or for specific endpoints:
@Controller('api/public')
export class PublicController {
    @Get()
    @SetMetadata(AUTH_ORG_KEY, false) // Skip organization check
    async publicEndpoint() {
        // Accessible without organization
    }
}
*/