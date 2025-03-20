import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DepartmentAuditService } from '../services/department-audit.service';
import { DepartmentAuditAction } from '../entities/department-audit-log.entity';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { UsersService } from '../../users/services/users.service';
// Update the import to use the DTO instead of the interface
import { SendNotificationDto } from '../../notifications/dto/send-notification.dto';

interface DepartmentAssignmentEvent {
  departmentId: string;
  organizationId: string;
  userId: string;
  performedById: string;
  action: 'ASSIGNED' | 'UNASSIGNED' | 'TRANSFERRED';
  previousDepartmentId?: string;
}

@Injectable()
export class DepartmentAssignmentListener {
  constructor(
    private readonly auditService: DepartmentAuditService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  @OnEvent('department.member.added')
  async handleMemberAdded(event: DepartmentAssignmentEvent) {
    // Create audit log
    await this.auditService.log({
      departmentId: event.departmentId,
      organizationId: event.organizationId,
      action: DepartmentAuditAction.MEMBER_ADDED,
      performedById: event.performedById,
      affectedUserId: event.userId,
      metadata: {
        action: event.action,
      },
    });

    // Notify user
    const user = await this.usersService.findById(event.userId);
    if (user) {
      const notification: SendNotificationDto = {
        userId: user.id,
        type: 'DEPARTMENT_ASSIGNMENT',
        title: 'Department Assignment',
        message: 'You have been assigned to a new department',
        data: {
          departmentId: event.departmentId,
          organizationId: event.organizationId,
        },
        organizationId: event.organizationId,
        priority: 'MEDIUM', // Changed from 'NORMAL' to 'MEDIUM'
      };
      await this.notificationsService.send(notification);
    }
  }

  @OnEvent('department.member.removed')
  async handleMemberRemoved(event: DepartmentAssignmentEvent) {
    // Create audit log
    await this.auditService.log({
      departmentId: event.departmentId,
      organizationId: event.organizationId,
      action: DepartmentAuditAction.MEMBER_REMOVED,
      performedById: event.performedById,
      affectedUserId: event.userId,
      metadata: {
        action: event.action,
      },
    });

    // Notify user
    const user = await this.usersService.findById(event.userId);
    if (user) {
      const notification: SendNotificationDto = {
        userId: user.id,
        type: 'DEPARTMENT_UNASSIGNMENT',
        title: 'Department Unassignment',
        message: 'You have been removed from a department',
        data: {
          departmentId: event.departmentId,
          organizationId: event.organizationId,
        },
        organizationId: event.organizationId,
        priority: 'MEDIUM', // Changed from 'NORMAL' to 'MEDIUM'
      };
      await this.notificationsService.send(notification);
    }
  }

  @OnEvent('department.member.transferred')
  async handleMemberTransferred(event: DepartmentAssignmentEvent) {
    // Create audit log
    await this.auditService.log({
      departmentId: event.departmentId,
      organizationId: event.organizationId,
      action: DepartmentAuditAction.MEMBER_TRANSFERRED,
      performedById: event.performedById,
      affectedUserId: event.userId,
      metadata: {
        action: event.action,
        previousDepartmentId: event.previousDepartmentId,
      },
    });

    // Notify user
    const user = await this.usersService.findById(event.userId);
    if (user) {
      const notification: SendNotificationDto = {
        userId: user.id,
        type: 'DEPARTMENT_TRANSFER',
        title: 'Department Transfer',
        message: 'You have been transferred to a different department',
        data: {
          departmentId: event.departmentId,
          previousDepartmentId: event.previousDepartmentId,
          organizationId: event.organizationId,
        },
        organizationId: event.organizationId,
        priority: 'MEDIUM', // Changed from 'NORMAL' to 'MEDIUM'
      };
      await this.notificationsService.send(notification);
    }
  }

  @OnEvent('department.manager.changed')
  async handleManagerChanged(event: {
    departmentId: string;
    organizationId: string;
    previousManagerId?: string;
    newManagerId: string;
    performedById: string;
  }) {
    // Create audit log
    await this.auditService.log({
      departmentId: event.departmentId,
      organizationId: event.organizationId,
      action: DepartmentAuditAction.MANAGER_CHANGED,
      performedById: event.performedById,
      affectedUserId: event.newManagerId,
      metadata: {
        previousManagerId: event.previousManagerId,
      },
    });

    // Notify new manager
    const newManagerNotification: SendNotificationDto = {
      userId: event.newManagerId,
      type: 'DEPARTMENT_MANAGER_ASSIGNMENT',
      title: 'Department Manager Assignment',
      message: 'You have been assigned as a department manager',
      data: {
        departmentId: event.departmentId,
        organizationId: event.organizationId,
      },
      organizationId: event.organizationId,
      priority: 'MEDIUM', // Changed from 'NORMAL' to 'MEDIUM'
    };
    await this.notificationsService.send(newManagerNotification);

    // Notify previous manager if exists
    if (event.previousManagerId) {
      const previousManagerNotification: SendNotificationDto = {
        userId: event.previousManagerId,
        type: 'DEPARTMENT_MANAGER_UNASSIGNMENT',
        title: 'Department Manager Unassignment',
        message: 'You are no longer the manager of a department',
        data: {
          departmentId: event.departmentId,
          organizationId: event.organizationId,
        },
        organizationId: event.organizationId,
        priority: 'MEDIUM', // Changed from 'NORMAL' to 'MEDIUM'
      };
      await this.notificationsService.send(previousManagerNotification);
    }
  }
}