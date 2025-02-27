import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Organization } from '../entities/organization.entity';

interface SubscriptionPlan {
    id: string;
    name: string;
    features: string[];
    limits: Record<string, number>;
    price: number;
}

@Injectable()
export class OrganizationSubscriptionService {
    private readonly logger = new Logger(OrganizationSubscriptionService.name);

    constructor(
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
        private readonly eventEmitter: EventEmitter2
    ) {}

    async createSubscription(organizationId: string, planId: string): Promise<void> {
        try {
            const organization = await this.organizationRepository.findOne({
                where: { id: organizationId }
            });

            if (!organization) {
                throw new Error(`Organization ${organizationId} not found`);
            }

            // Validate plan
            const plan = await this.getPlan(planId);
            if (!plan) {
                throw new Error(`Invalid plan ID: ${planId}`);
            }

            // Update organization with subscription details
            organization.subscription = {
                planId,
                status: 'active',
                startDate: new Date(),
                features: plan.features,
                limits: plan.limits,
            };

            await this.organizationRepository.save(organization);

            // Emit subscription created event
            this.eventEmitter.emit('organization.subscription.created', {
                organizationId,
                planId,
            });
        } catch (error) {
            this.logger.error(`Error creating subscription for organization ${organizationId}:`, error);
            throw error;
        }
    }

    async updateSubscription(
        organizationId: string,
        planId: string,
        changes: Record<string, any>
    ): Promise<void> {
        try {
            const organization = await this.organizationRepository.findOne({
                where: { id: organizationId }
            });

            if (!organization) {
                throw new Error(`Organization ${organizationId} not found`);
            }

            const oldPlanId = organization.subscription?.planId;

            // Update subscription details
            organization.subscription = {
                ...organization.subscription,
                ...changes,
                planId,
                updatedAt: new Date(),
            };

            await this.organizationRepository.save(organization);

            // Emit subscription updated event
            this.eventEmitter.emit('organization.subscription.updated', {
                organizationId,
                oldPlanId,
                newPlanId: planId,
                changes,
            });
        } catch (error) {
            this.logger.error(`Error updating subscription for organization ${organizationId}:`, error);
            throw error;
        }
    }

    async cancelSubscription(organizationId: string, reason?: string): Promise<void> {
        try {
            const organization = await this.organizationRepository.findOne({
                where: { id: organizationId }
            });

            if (!organization) {
                throw new Error(`Organization ${organizationId} not found`);
            }

            // Update subscription status
            organization.subscription = {
                ...organization.subscription,
                status: 'cancelled',
                cancelledAt: new Date(),
                cancellationReason: reason,
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            };

            await this.organizationRepository.save(organization);

            // Emit subscription cancelled event
            this.eventEmitter.emit('organization.subscription.cancelled', {
                organizationId,
                reason,
            });
        } catch (error) {
            this.logger.error(`Error cancelling subscription for organization ${organizationId}:`, error);
            throw error;
        }
    }

    async checkSubscriptionStatus(organizationId: string): Promise<boolean> {
        try {
            const organization = await this.organizationRepository.findOne({
                where: { id: organizationId }
            });

            if (!organization?.subscription) {
                return false;
            }

            // Check if subscription is active and not expired
            return (
                organization.subscription.status === 'active' &&
                (!organization.subscription.endDate ||
                    new Date(organization.subscription.endDate) > new Date())
            );
        } catch (error) {
            this.logger.error(`Error checking subscription status for organization ${organizationId}:`, error);
            throw error;
        }
    }

    async validateFeatureAccess(organizationId: string, feature: string): Promise<boolean> {
        try {
            const organization = await this.organizationRepository.findOne({
                where: { id: organizationId }
            });

            if (!organization?.subscription) {
                return false;
            }

            return organization.subscription.features.includes(feature);
        } catch (error) {
            this.logger.error(`Error validating feature access for organization ${organizationId}:`, error);
            throw error;
        }
    }

    async checkResourceLimit(organizationId: string, resource: string): Promise<{
        allowed: boolean;
        limit: number;
        current: number;
    }> {
        try {
            const organization = await this.organizationRepository.findOne({
                where: { id: organizationId }
            });

            if (!organization?.subscription) {
                return { allowed: false, limit: 0, current: 0 };
            }

            const limit = organization.subscription.limits[resource] || 0;
            const current = await this.getCurrentResourceUsage(organizationId, resource);

            return {
                allowed: current < limit,
                limit,
                current,
            };
        } catch (error) {
            this.logger.error(`Error checking resource limit for organization ${organizationId}:`, error);
            throw error;
        }
    }

    private async getPlan(planId: string): Promise<SubscriptionPlan | null> {
        // Implementation would typically fetch from a database or external service
        // This is a placeholder implementation
        const plans: Record<string, SubscriptionPlan> = {
            basic: {
                id: 'basic',
                name: 'Basic Plan',
                features: ['feature1', 'feature2'],
                limits: { users: 10, storage: 5 },
                price: 10,
            },
            pro: {
                id: 'pro',
                name: 'Pro Plan',
                features: ['feature1', 'feature2', 'feature3'],
                limits: { users: 50, storage: 25 },
                price: 25,
            },
        };

        return plans[planId] || null;
    }

    private async getCurrentResourceUsage(organizationId: string, resource: string): Promise<number> {
        // Implementation would vary based on the resource type
        // This is a placeholder implementation
        const resourceCounters: Record<string, () => Promise<number>> = {
            users: async () => {
                const org = await this.organizationRepository.findOne({
                    where: { id: organizationId },
                    relations: ['members'],
                });
                return org?.members?.length || 0;
            },
            storage: async () => {
                // Implementation for checking storage usage
                return 0;
            },
        };

        if (resourceCounters[resource]) {
            return await resourceCounters[resource]();
        }

        return 0;
    }
}