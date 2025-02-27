import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { OrganizationsController } from './controllers/organizations.controller';
import { OrganizationsService } from './services/organizations.service';
import { Organization } from './entities/organization.entity';

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

@Module({
    imports: [
        TypeOrmModule.forFeature([Organization]),
        EventEmitterModule.forRoot({
            // Global event emitter configuration
            wildcard: true,
            delimiter: '.',
            maxListeners: 20,
            verboseMemoryLeak: true,
        }),
        UsersModule,
        AuthModule,
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
export class OrganizationsModule {
    // Optional: Implement custom module initialization logic
    // async onModuleInit() {
    //     // Initialize any required resources
    // }

    // Optional: Implement custom module cleanup logic
    // async onModuleDestroy() {
    //     // Cleanup any resources
    // }
}