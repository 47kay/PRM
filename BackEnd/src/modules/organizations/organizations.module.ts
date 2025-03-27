// src/modules/organizations/organizations.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { OrganizationsController } from './controllers/organizations.controller';
import { OrganizationsService } from './services/organizations.service';
import { Organization } from './entities/organization.entity';
import { OrganizationInvitation } from './entities/organization-invitation.entity';
import { OrganizationAuditLog } from './entities/organization-audit-log.entity'; // Add this import
import { User } from '../users/entities/user.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';

import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

// Import organization-related listeners
import { OrganizationBillingListener } from './listeners/organization-billing.listener';
import { OrganizationAuditListener } from './listeners/organization-audit.listener';

// Import organization-related services
import { OrganizationSubscriptionService } from './services/organization-subscription.service';
import { OrganizationInvitationService } from './services/organization-invitation.service';
import { OrganizationAuditService } from './services/organization-audit.service';

// Import organization-related guards
import { OrganizationAccessGuard } from './guards/organization-access.guard';
import { OrganizationRoleGuard } from './guards/organization-role.guard';

// Import required services from other modules
import { DomainVerificationService } from '../domain/services/domain-verification.service';
import { EmailService } from '../../shared/services/email.service';
import { StorageService } from '../storage/services/storage.service';
import { Domain } from 'domain';
import { DomainVerificationToken } from '../domain/entities/domain-verification-token.entity';
import { EmailTemplate } from '../notifications/entities/email-template.entity';
import { EmailLog } from '../notifications/entities/email-log.entity';
import { EmailQueue } from '../notifications/entities/email-queue.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Organization,
            OrganizationInvitation,
            OrganizationAuditLog, // Add this entity
            User,
            AuditLog,
            Domain,
            DomainVerificationService,
            DomainVerificationToken,
            EmailTemplate,
            EmailLog,
            EmailQueue,
            EmailService,
            
        ]),
        EventEmitterModule.forRoot({
            wildcard: true,
            delimiter: '.',
            maxListeners: 20,
            verboseMemoryLeak: true,
        }),
        forwardRef(() => UsersModule),
        forwardRef(() => AuthModule),
    ],
    controllers: [
        OrganizationsController
    ],
    providers: [
        // Core services
        OrganizationsService,
        OrganizationSubscriptionService,
        OrganizationInvitationService,
        OrganizationAuditService,

        // Event listeners
        OrganizationBillingListener,
        OrganizationAuditListener,

        // Guards
        OrganizationAccessGuard,
        OrganizationRoleGuard,
        
        // Services from other modules that are required by OrganizationsService
        DomainVerificationService,
        EmailService,
        StorageService,
    ],
    exports: [
        // Export services that other modules might need
        OrganizationsService,
        OrganizationSubscriptionService,
        OrganizationInvitationService,

        // Export guards for reuse
        OrganizationAccessGuard,
        OrganizationRoleGuard,
    ]
})
export class OrganizationsModule {}