import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { EmailService } from '../../../shared/services/email.service';
import { AuditService } from '../../../shared/services/audit.service';
import { User } from '../entities/user.entity';

interface BaseUserEvent {
  user: User;
  performedBy?: string;
  organizationId?: string;
  metadata?: Record<string, any>;
}

interface PasswordChangeEvent extends BaseUserEvent {
  requiresReset?: boolean;
  expiresAt?: Date;
}

interface LoginEvent extends BaseUserEvent {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class UserEventListener {
  private readonly logger = new Logger(UserEventListener.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    private readonly auditService: AuditService,
  ) {}

  @OnEvent('user.created')
  async handleUserCreated(event: BaseUserEvent): Promise<void> {
    try {
      await Promise.all([
        this.auditService.log({
          action: 'USER_CREATED',
          entityType: 'USER',
          entityId: event.user.id,
          actorId: event.performedBy, // Changed from userId to actorId
          organizationId: event.organizationId,
          metadata: event.metadata,
        }),

        this.emailService.sendEmail({
          to: event.user.email,
          subject: 'Welcome to the Platform',
          template: 'welcome-email',
          context: {
            firstName: event.user.firstName,
            loginUrl: `${process.env.APP_URL}/login`,
          },
        }),

        event.organizationId &&
          this.notificationsService.send({
            type: 'USER_CREATED',
            title: 'New User Created',
            message: `${event.user.firstName} ${event.user.lastName} has joined the organization`,
            organizationId: event.organizationId,
            data: {
              userId: event.user.id,
              email: event.user.email,
            },
            userId: '',
          }),
      ].filter(Boolean));
    } catch (error) {
      this.logger.error('Error handling user created event', { 
        error, 
        userId: event.user.id 
      });
      throw error;
    }
  }

  @OnEvent('user.updated')
  async handleUserUpdated(event: BaseUserEvent): Promise<void> {
    try {
      await this.auditService.log({
        action: 'USER_UPDATED',
        entityType: 'USER',
        entityId: event.user.id,
        actorId: event.performedBy, // Changed from userId to actorId
        organizationId: event.organizationId,
        metadata: event.metadata,
      });

      if (event.metadata?.importantChanges) {
        await this.notificationsService.send({
          type: 'PROFILE_UPDATED',
          title: 'Profile Updates',
          message: 'Your profile information has been updated',
          data: {
            changes: event.metadata.importantChanges,
          },
          userId: '',
        });
      }
    } catch (error) {
      this.logger.error('Error handling user updated event', {
        error,
        userId: event.user.id,
      });
      throw error;
    }
  }

  @OnEvent('user.password.changed')
  async handlePasswordChanged(event: PasswordChangeEvent): Promise<void> {
    try {
      await Promise.all([
        this.auditService.log({
          action: 'PASSWORD_CHANGED',
          entityType: 'USER',
          entityId: event.user.id,
          actorId: event.performedBy || event.user.id, // Changed from userId to actorId
          organizationId: event.organizationId,
          metadata: {
            requiresReset: event.requiresReset,
            expiresAt: event.expiresAt,
          },
        }),

        this.emailService.sendEmail({
          to: event.user.email,
          subject: 'Password Changed',
          template: 'password-changed',
          context: {
            firstName: event.user.firstName,
            requiresReset: event.requiresReset,
            expiresAt: event.expiresAt,
          },
        }),
      ]);
    } catch (error) {
      this.logger.error('Error handling password changed event', {
        error,
        userId: event.user.id,
      });
      throw error;
    }
  }

  @OnEvent('user.status.changed')
  async handleStatusChanged(event: BaseUserEvent): Promise<void> {
    try {
      const status = event.user.isActive ? 'activated' : 'deactivated';

      await Promise.all([
        this.auditService.log({
          action: `USER_${status.toUpperCase()}`,
          entityType: 'USER',
          entityId: event.user.id,
          actorId: event.performedBy, // Changed from userId to actorId
          organizationId: event.organizationId,
          metadata: event.metadata,
        }),

        event.organizationId &&
          this.notificationsService.send({
            type: 'USER_STATUS_CHANGED',
            title: `User Account ${status}`,
            message: `${event.user.firstName} ${event.user.lastName}'s account has been ${status}`,
            organizationId: event.organizationId,
            data: {
              userId: event.user.id,
              status,
            },
            userId: '',
          }),

        this.emailService.sendEmail({
          to: event.user.email,
          subject: `Account ${status}`,
          template: `account-${status}`,
          context: {
            firstName: event.user.firstName,
          },
        }),
      ].filter(Boolean));
    } catch (error) {
      this.logger.error('Error handling user status changed event', {
        error,
        userId: event.user.id,
      });
      throw error;
    }
  }

  @OnEvent('user.deleted')
  async handleUserDeleted(event: BaseUserEvent): Promise<void> {
    try {
      await Promise.all([
        this.auditService.log({
          action: 'USER_DELETED',
          entityType: 'USER',
          entityId: event.user.id,
          actorId: event.performedBy, // Changed from userId to actorId
          organizationId: event.organizationId,
          metadata: event.metadata,
        }),

        event.organizationId &&
          this.notificationsService.send({
            type: 'USER_DELETED',
            title: 'User Account Deleted',
            message: `${event.user.firstName} ${event.user.lastName}'s account has been deleted`,
            organizationId: event.organizationId,
            data: {
              userId: event.user.id,
              email: event.user.email,
            },
            userId: '',
          }),
      ].filter(Boolean));
    } catch (error) {
      this.logger.error('Error handling user deleted event', {
        error,
        userId: event.user.id,
      });
      throw error;
    }
  }

  @OnEvent('user.login')
  async handleUserLogin(event: LoginEvent): Promise<void> {
    try {
      await Promise.all([
        this.auditService.log({
          action: 'USER_LOGIN',
          entityType: 'USER',
          entityId: event.user.id,
          actorId: event.user.id, // Changed from userId to actorId
          organizationId: event.organizationId,
          metadata: {
            ip: event.ip,
            userAgent: event.userAgent,
            ...event.metadata,
          },
        }),

        event.metadata?.suspicious &&
          this.notificationsService.send({
            type: 'SUSPICIOUS_LOGIN',
            title: 'Suspicious Login Detected',
            message: 'A login attempt from an unrecognized device was detected',
            userId: event.user.id,
            priority: 'HIGH',
            data: {
              ip: event.ip,
              userAgent: event.userAgent,
              location: event.metadata.location,
            },
          }),
      ].filter(Boolean));
    } catch (error) {
      this.logger.error('Error handling user login event', {
        error,
        userId: event.user.id,
      });
      throw error;
    }
  }
}