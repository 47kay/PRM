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
import { OrganizationsService } from '../../modules/organizations/services/organizations.service';
import { AUTH_ORG_KEY } from '../decorators/auth.decorator';
import { Organization } from '../../modules/organizations/entities/organization.entity';

// Define a custom interface extending Express Request to include organization
interface RequestWithOrganization extends Request {
    organization?: Organization;
    user?: any; // Also declare user for better type safety
}

@Injectable()
export class OrganizationGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly organizationService: OrganizationsService,
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

        const request = context.switchToHttp().getRequest<RequestWithOrganization>();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (!user.organizationId) {
            throw new ForbiddenException('User is not associated with any organization');
        }

        try {
            // Get organization details
            const organization = await this.organizationService.findOne(user.organizationId);

            if (!organization) {
                throw new ForbiddenException('Organization not found');
            }

            // Check if organization is active
            if (organization.status !== 'ACTIVE') {
                throw new ForbiddenException('Organization is inactive');
            }

            // Check subscription status
            if (!this.isSubscriptionValid(organization)) {
                throw new ForbiddenException('Organization subscription is invalid or expired');
            }

            // Check organization limits
            await this.checkOrganizationLimits(organization, request);

            // Add organization to request for use in controllers
            request.organization = organization;

            return true;
        } catch (error) {
            if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new ForbiddenException('Organization access denied');
        }
    }

    private isSubscriptionValid(organization: Organization): boolean {
        const now = new Date();
        const subscriptionEnd = organization.subscriptionEndDate;

        // Check if subscription is active
        if (!organization.isSubscriptionActive) {
            return false;
        }

        // Check if subscription end date is valid
        if (subscriptionEnd && subscriptionEnd < now) {
            return false;
        }

        return true;
    }

    private async checkOrganizationLimits(organization: Organization, request: RequestWithOrganization): Promise<void> {
        // Check user limit
        if (organization.maxUsers > 0) {
            const userCount = await this.organizationService.getAdminCount(organization.id);
            if (userCount >= organization.maxUsers) {
                throw new ForbiddenException('Organization user limit reached');
            }
        }

        // Check storage limit
        if (organization.maxStorage > 0 && request.url.includes('/storage')) {
            const statistics = await this.organizationService.getStatistics(organization.id);
            if (statistics.storageUsed >= organization.maxStorage) {
                throw new ForbiddenException('Organization storage limit reached');
            }
        }

        // Check feature access
        const requestedFeature = this.getRequestedFeature(request);
        if (requestedFeature && !this.hasFeatureAccess(organization, requestedFeature)) {
            throw new ForbiddenException(`Access to ${requestedFeature} feature is not included in your plan`);
        }
    }

    private getRequestedFeature(request: RequestWithOrganization): string | null {
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

    private hasFeatureAccess(organization: Organization, feature: string): boolean {
        // Check if the feature is included in the organization's settings or tier-based features
        const tierFeatures = this.getTierFeatures(organization.subscriptionTier);
        return tierFeatures.includes(feature);
    }

    private getTierFeatures(tier: string): string[] {
        const tierFeaturesMap: Record<string, string[]> = {
            'FREE': ['BASIC'],
            'BASIC': ['BASIC', 'DATA_EXPORT'],
            'PROFESSIONAL': ['BASIC', 'DATA_EXPORT', 'ADVANCED_ANALYTICS'],
            'ENTERPRISE': ['BASIC', 'DATA_EXPORT', 'ADVANCED_ANALYTICS', 'WHATSAPP_INTEGRATION'],
        };

        return tierFeaturesMap[tier] || [];
    }
}