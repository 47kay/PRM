import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { OrganizationSubscriptionService } from '../services/organization-subscription.service';

@Injectable()
export class OrganizationBillingListener {
    private readonly logger = new Logger(OrganizationBillingListener.name);

    constructor(
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
        private readonly subscriptionService: OrganizationSubscriptionService
    ) {}

    @OnEvent('organization.subscription.created')
    async handleSubscriptionCreated(payload: { organizationId: string; planId: string }) {
        try {
            const { organizationId, planId } = payload;
            this.logger.debug(`Processing new subscription for organization ${organizationId}`);

            const organization = await this.organizationRepository.findOne({
                where: { id: organizationId }
            });

            if (!organization) {
                throw new Error(`Organization ${organizationId} not found`);
            }

            // Update organization billing status
            organization.billing = {
                ...organization.billing,
                status: 'active',
                planId,
                startDate: new Date(),
            };

            await this.organizationRepository.save(organization);
        } catch (error) {
            this.logger.error('Error processing subscription creation:', error);
            throw error;
        }
    }

    @OnEvent('organization.subscription.updated')
    async handleSubscriptionUpdated(payload: { 
        organizationId: string; 
        planId: string;
        changes: Record<string, any>;
    }) {
        try {
            const { organizationId, planId, changes } = payload;
            this.logger.debug(`Processing subscription update for organization ${organizationId}`);

            await this.subscriptionService.updateSubscription(organizationId, planId, changes);
        } catch (error) {
            this.logger.error('Error processing subscription update:', error);
            throw error;
        }
    }

    @OnEvent('organization.subscription.cancelled')
    async handleSubscriptionCancelled(payload: { organizationId: string }) {
        try {
            const { organizationId } = payload;
            this.logger.debug(`Processing subscription cancellation for organization ${organizationId}`);

            const organization = await this.organizationRepository.findOne({
                where: { id: organizationId }
            });

            if (!organization) {
                throw new Error(`Organization ${organizationId} not found`);
            }

            // Update organization billing status
            organization.billing = {
                ...organization.billing,
                status: 'cancelled',
                cancelledAt: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            };

            await this.organizationRepository.save(organization);
        } catch (error) {
            this.logger.error('Error processing subscription cancellation:', error);
            throw error;
        }
    }

    @OnEvent('organization.billing.payment_failed')
    async handlePaymentFailed(payload: { 
        organizationId: string;
        failureReason: string;
        attemptCount: number;
    }) {
        try {
            const { organizationId, failureReason, attemptCount } = payload;
            this.logger.debug(`Processing payment failure for organization ${organizationId}`);

            const organization = await this.organizationRepository.findOne({
                where: { id: organizationId }
            });

            if (!organization) {
                throw new Error(`Organization ${organizationId} not found`);
            }

            // Update billing status and record failure
            organization.billing = {
                ...organization.billing,
                lastPaymentFailure: {
                    date: new Date(),
                    reason: failureReason,
                    attemptCount,
                },
            };

            // If multiple failures, mark as past due
            if (attemptCount > 2) {
                organization.billing.status = 'past_due';
            }

            await this.organizationRepository.save(organization);
        } catch (error) {
            this.logger.error('Error processing payment failure:', error);
            throw error;
        }
    }

    @OnEvent('organization.billing.invoice_paid')
    async handleInvoicePaid(payload: { 
        organizationId: string;
        invoiceId: string;
        amount: number;
    }) {
        try {
            const { organizationId, invoiceId, amount } = payload;
            this.logger.debug(`Processing paid invoice for organization ${organizationId}`);

            const organization = await this.organizationRepository.findOne({
                where: { id: organizationId }
            });

            if (!organization) {
                throw new Error(`Organization ${organizationId} not found`);
            }

            // Update billing records
            organization.billing = {
                ...organization.billing,
                lastPaymentDate: new Date(),
                lastPaymentAmount: amount,
                lastInvoiceId: invoiceId,
                status: 'active', // Ensure status is active after successful payment
            };

            await this.organizationRepository.save(organization);
        } catch (error) {
            this.logger.error('Error processing paid invoice:', error);
            throw error;
        }
    }
}