import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { OrganizationAuditService } from '../services/organization-audit.service';

@Injectable()
export class OrganizationAuditListener {
    private readonly logger = new Logger(OrganizationAuditListener.name);

    constructor(
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
        private readonly auditService: OrganizationAuditService
    ) {}

    @OnEvent('organization.member.added')
    async handleMemberAdded(payload: { 
        organizationId: string;
        userId: string;
        role: string;
        addedBy: string;
    }) {
        try {
            const { organizationId, userId, role, addedBy } = payload;
            
            await this.auditService.logEvent({
                organizationId,
                eventType: 'member_added',
                data: { userId, role },
                performedBy: addedBy,
                timestamp: new Date()
            });
        } catch (error) {
            this.logger.error('Error logging member addition:', error);
            throw error;
        }
    }

    @OnEvent('organization.member.removed')
    async handleMemberRemoved(payload: { 
        organizationId: string;
        userId: string;
        removedBy: string;
        reason?: string;
    }) {
        try {
            const { organizationId, userId, removedBy, reason } = payload;
            
            await this.auditService.logEvent({
                organizationId,
                eventType: 'member_removed',
                data: { userId, reason },
                performedBy: removedBy,
                timestamp: new Date()
            });
        } catch (error) {
            this.logger.error('Error logging member removal:', error);
            throw error;
        }
    }

    @OnEvent('organization.role.changed')
    async handleRoleChanged(payload: { 
        organizationId: string;
        userId: string;
        oldRole: string;
        newRole: string;
        changedBy: string;
    }) {
        try {
            const { organizationId, userId, oldRole, newRole, changedBy } = payload;
            
            await this.auditService.logEvent({
                organizationId,
                eventType: 'role_changed',
                data: { userId, oldRole, newRole },
                performedBy: changedBy,
                timestamp: new Date()
            });
        } catch (error) {
            this.logger.error('Error logging role change:', error);
            throw error;
        }
    }

    @OnEvent('organization.settings.updated')
    async handleSettingsUpdated(payload: { 
        organizationId: string;
        changes: Record<string, any>;
        updatedBy: string;
    }) {
        try {
            const { organizationId, changes, updatedBy } = payload;
            
            await this.auditService.logEvent({
                organizationId,
                eventType: 'settings_updated',
                data: { changes },
                performedBy: updatedBy,
                timestamp: new Date()
            });
        } catch (error) {
            this.logger.error('Error logging settings update:', error);
            throw error;
        }
    }

    @OnEvent('organization.subscription.changed')
    async handleSubscriptionChanged(payload: { 
        organizationId: string;
        oldPlan: string;
        newPlan: string;
        changedBy: string;
    }) {
        try {
            const { organizationId, oldPlan, newPlan, changedBy } = payload;
            
            await this.auditService.logEvent({
                organizationId,
                eventType: 'subscription_changed',
                data: { oldPlan, newPlan },
                performedBy: changedBy,
                timestamp: new Date()
            });
        } catch (error) {
            this.logger.error('Error logging subscription change:', error);
            throw error;
        }
    }
}