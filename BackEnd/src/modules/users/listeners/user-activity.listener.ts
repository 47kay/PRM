import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserActivityService, ActivityType } from '../services/user-activity.service';
import { Request } from 'express';

interface BaseActivityEvent {
  userId: string;
  organizationId?: string;
  request?: Request;
}

interface AuthActivityEvent extends BaseActivityEvent {
  status: 'SUCCESS' | 'FAILURE';
  failureReason?: string;
}

@Injectable()
export class UserActivityListener {
  private readonly logger = new Logger(UserActivityListener.name);

  constructor(
    private readonly activityService: UserActivityService,
  ) {}

  @OnEvent('user.login')
  async handleUserLogin(event: AuthActivityEvent) {
    await this.activityService.logActivity({
      userId: event.userId,
      organizationId: event.organizationId,
      type: ActivityType.LOGIN,
      status: event.status,
      failureReason: event.failureReason,
      ip: event.request?.ip,
      userAgent: event.request?.headers['user-agent'],
      referrer: event.request?.headers.referer,
    });
  }

  @OnEvent('user.logout')
  async handleUserLogout(event: BaseActivityEvent) {
    await this.activityService.logActivity({
      userId: event.userId,
      organizationId: event.organizationId,
      type: ActivityType.LOGOUT,
      ip: event.request?.ip,
      userAgent: event.request?.headers['user-agent'],
    });
  }

  @OnEvent('user.password_change')
  async handlePasswordChange(event: AuthActivityEvent) {
    await this.activityService.logActivity({
      userId: event.userId,
      organizationId: event.organizationId,
      type: ActivityType.PASSWORD_CHANGE,
      status: event.status,
      failureReason: event.failureReason,
      ip: event.request?.ip,
      userAgent: event.request?.headers['user-agent'],
    });
  }

  @OnEvent('user.profile_update')
  async handleProfileUpdate(event: BaseActivityEvent & { changes: Record<string, any> }) {
    await this.activityService.logActivity({
      userId: event.userId,
      organizationId: event.organizationId,
      type: ActivityType.PROFILE_UPDATE,
      metadata: { changes: event.changes },
      ip: event.request?.ip,
      userAgent: event.request?.headers['user-agent'],
    });
  }

  @OnEvent('user.mfa.enabled')
  async handleMfaEnabled(event: BaseActivityEvent) {
    await this.activityService.logActivity({
      userId: event.userId,
      organizationId: event.organizationId,
      type: ActivityType.MFA_ENABLED,
      ip: event.request?.ip,
      userAgent: event.request?.headers['user-agent'],
    });
  }

  @OnEvent('user.mfa.disabled')
  async handleMfaDisabled(event: BaseActivityEvent) {
    await this.activityService.logActivity({
      userId: event.userId,
      organizationId: event.organizationId,
      type: ActivityType.MFA_DISABLED,
      ip: event.request?.ip,
      userAgent: event.request?.headers['user-agent'],
    });
  }

  @OnEvent('user.role_change')
  async handleRoleChange(event: BaseActivityEvent & {
    oldRole: string;
    newRole: string;
    changedBy: string;
  }) {
    await this.activityService.logActivity({
      userId: event.userId,
      organizationId: event.organizationId,
      type: ActivityType.ROLE_CHANGE,
      metadata: {
        oldRole: event.oldRole,
        newRole: event.newRole,
        changedBy: event.changedBy,
      },
      ip: event.request?.ip,
      userAgent: event.request?.headers['user-agent'],
    });
  }

  @OnEvent('user.department_assignment')
  async handleDepartmentAssignment(event: BaseActivityEvent & {
    departmentId: string;
    action: 'ASSIGNED' | 'REMOVED';
    performedBy: string;
  }) {
    await this.activityService.logActivity({
      userId: event.userId,
      organizationId: event.organizationId,
      type: ActivityType.DEPARTMENT_ASSIGNMENT,
      metadata: {
        departmentId: event.departmentId,
        action: event.action,
        performedBy: event.performedBy,
      },
      ip: event.request?.ip,
      userAgent: event.request?.headers['user-agent'],
    });
  }

  @OnEvent('user.permission_change')
  async handlePermissionChange(event: BaseActivityEvent & {
    changes: {
      added?: string[];
      removed?: string[];
    };
    performedBy: string;
  }) {
    await this.activityService.logActivity({
      userId: event.userId,
      organizationId: event.organizationId,
      type: ActivityType.PERMISSION_CHANGE,
      metadata: {
        changes: event.changes,
        performedBy: event.performedBy,
      },
      ip: event.request?.ip,
      userAgent: event.request?.headers['user-agent'],
    });
  }

  @OnEvent('user.data_export')
  async handleDataExport(event: BaseActivityEvent & {
    exportType: string;
    dataTypes: string[];
  }) {
    await this.activityService.logActivity({
      userId: event.userId,
      organizationId: event.organizationId,
      type: ActivityType.EXPORT_DATA,
      metadata: {
        exportType: event.exportType,
        dataTypes: event.dataTypes,
      },
      ip: event.request?.ip,
      userAgent: event.request?.headers['user-agent'],
    });
  }

  @OnEvent('user.bulk_action')
  async handleBulkAction(event: BaseActivityEvent & {
    action: string;
    targetIds: string[];
    metadata?: Record<string, any>;
  }) {
    await this.activityService.logActivity({
      userId: event.userId,
      organizationId: event.organizationId,
      type: ActivityType.BULK_ACTION,
      metadata: {
        action: event.action,
        targetIds: event.targetIds,
        ...event.metadata,
      },
      ip: event.request?.ip,
      userAgent: event.request?.headers['user-agent'],
    });
  }
}