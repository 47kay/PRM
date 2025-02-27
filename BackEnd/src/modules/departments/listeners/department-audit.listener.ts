import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DepartmentAuditService } from '../services/department-audit.service';
import { DepartmentAuditAction } from '../entities/department-audit-log.entity';
import { Request } from 'express';

@Injectable()
export class DepartmentAuditListener {
  constructor(
    private readonly auditService: DepartmentAuditService,
  ) {}

  @OnEvent('department.created')
  async handleDepartmentCreated(event: {
    departmentId: string;
    organizationId: string;
    createdById: string;
    request?: Request;
  }) {
    await this.auditService.log({
      departmentId: event.departmentId,
      organizationId: event.organizationId,
      action: DepartmentAuditAction.CREATED,
      performedById: event.createdById,
      request: event.request,
    });
  }

  @OnEvent('department.updated')
  async handleDepartmentUpdated(event: {
    departmentId: string;
    organizationId: string;
    updatedById: string;
    changes: Record<string, any>;
    request?: Request;
  }) {
    await this.auditService.log({
      departmentId: event.departmentId,
      organizationId: event.organizationId,
      action: DepartmentAuditAction.UPDATED,
      performedById: event.updatedById,
      changes: event.changes,
      request: event.request,
    });
  }

  @OnEvent('department.deleted')
  async handleDepartmentDeleted(event: {
    departmentId: string;
    organizationId: string;
    deletedById: string;
    request?: Request;
  }) {
    await this.auditService.log({
      departmentId: event.departmentId,
      organizationId: event.organizationId,
      action: DepartmentAuditAction.DELETED,
      performedById: event.deletedById,
      request: event.request,
    });
  }

  @OnEvent('department.moved')
  async handleDepartmentMoved(event: {
    departmentId: string;
    organizationId: string;
    performedById: string;
    previousParentId?: string;
    newParentId?: string;
    request?: Request;
  }) {
    await this.auditService.log({
      departmentId: event.departmentId,
      organizationId: event.organizationId,
      action: DepartmentAuditAction.MOVED,
      performedById: event.performedById,
      metadata: {
        previousParentId: event.previousParentId,
        newParentId: event.newParentId,
      },
      request: event.request,
    });
  }

  @OnEvent('department.reordered')
  async handleDepartmentReordered(event: {
    departmentId: string;
    organizationId: string;
    performedById: string;
    newOrder: string[];
    request?: Request;
  }) {
    await this.auditService.log({
      departmentId: event.departmentId,
      organizationId: event.organizationId,
      action: DepartmentAuditAction.REORDERED,
      performedById: event.performedById,
      metadata: {
        newOrder: event.newOrder,
      },
      request: event.request,
    });
  }

  @OnEvent('department.bulk_update')
  async handleBulkUpdate(event: {
    departmentIds: string[];
    organizationId: string;
    performedById: string;
    changes: Record<string, any>;
    request?: Request;
  }) {
    // Create separate audit logs for each department affected
    for (const departmentId of event.departmentIds) {
      await this.auditService.log({
        departmentId,
        organizationId: event.organizationId,
        action: DepartmentAuditAction.UPDATED,
        performedById: event.performedById,
        changes: event.changes,
        metadata: {
          bulkUpdate: true,
          totalDepartments: event.departmentIds.length,
        },
        request: event.request,
      });
    }
  }

  @OnEvent('department.hierarchy.changed')
  async handleHierarchyChanged(event: {
    departmentId: string;
    organizationId: string;
    performedById: string;
    changes: {
      oldHierarchy: Record<string, any>;
      newHierarchy: Record<string, any>;
    };
    request?: Request;
  }) {
    await this.auditService.log({
      departmentId: event.departmentId,
      organizationId: event.organizationId,
      action: DepartmentAuditAction.UPDATED,
      performedById: event.performedById,
      changes: event.changes,
      metadata: {
        hierarchyUpdate: true,
      },
      request: event.request,
    });
  }

  @OnEvent('department.settings.updated')
  async handleSettingsUpdated(event: {
    departmentId: string;
    organizationId: string;
    performedById: string;
    changes: Record<string, any>;
    request?: Request;
  }) {
    await this.auditService.log({
      departmentId: event.departmentId,
      organizationId: event.organizationId,
      action: DepartmentAuditAction.UPDATED,
      performedById: event.performedById,
      changes: event.changes,
      metadata: {
        settingsUpdate: true,
      },
      request: event.request,
    });
  }

  @OnEvent('department.access.modified')
  async handleAccessModified(event: {
    departmentId: string;
    organizationId: string;
    performedById: string;
    changes: {
      roleId: string;
      permissions: string[];
      action: 'GRANTED' | 'REVOKED';
    };
    request?: Request;
  }) {
    await this.auditService.log({
      departmentId: event.departmentId,
      organizationId: event.organizationId,
      action: DepartmentAuditAction.UPDATED,
      performedById: event.performedById,
      metadata: {
        accessUpdate: true,
        ...event.changes,
      },
      request: event.request,
    });
  }
}