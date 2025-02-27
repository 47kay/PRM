import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { DepartmentAuditLog, DepartmentAuditAction } from '../entities/department-audit-log.entity';
import { Department } from '../entities/department.entity';

interface AuditLogOptions {
  departmentId: string;
  organizationId: string;
  action: DepartmentAuditAction;
  performedById: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  affectedUserId?: string;
  request?: Request;
}

interface ChangeRecord {
  old: any;
  new: any;
}

@Injectable()
export class DepartmentAuditService {
  constructor(
    @InjectRepository(DepartmentAuditLog)
    private readonly auditLogRepository: Repository<DepartmentAuditLog>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  /**
   * Create audit log entry
   */
  async log(options: AuditLogOptions): Promise<DepartmentAuditLog> {
    const auditLog = this.auditLogRepository.create({
      departmentId: options.departmentId,
      organizationId: options.organizationId,
      action: options.action,
      performedById: options.performedById,
      changes: options.changes,
      metadata: options.metadata,
      affectedUserId: options.affectedUserId,
      ipAddress: options.request?.ip,
      userAgent: options.request?.headers['user-agent'],
    });

    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Get audit trail for a specific department
   */
  async getDepartmentAuditTrail(
    departmentId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      actions?: DepartmentAuditAction[];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<[DepartmentAuditLog[], number]> {
    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.performedBy', 'performer')
      .leftJoinAndSelect('audit.affectedUser', 'affected')
      .where('audit.departmentId = :departmentId', { departmentId });

    if (options.startDate) {
      queryBuilder.andWhere('audit.createdAt >= :startDate', { 
        startDate: options.startDate 
      });
    }

    if (options.endDate) {
      queryBuilder.andWhere('audit.createdAt <= :endDate', { 
        endDate: options.endDate 
      });
    }

    if (options.actions?.length) {
      queryBuilder.andWhere('audit.action IN (:...actions)', { 
        actions: options.actions 
      });
    }

    return queryBuilder
      .orderBy('audit.createdAt', 'DESC')
      .take(options.limit || 50)
      .skip(options.offset || 0)
      .getManyAndCount();
  }

  /**
   * Get user activity in departments
   */
  async getUserDepartmentActivity(
    userId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      departmentIds?: string[];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<[DepartmentAuditLog[], number]> {
    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('(audit.performedById = :userId OR audit.affectedUserId = :userId)', 
        { userId }
      );

    if (options.departmentIds?.length) {
      queryBuilder.andWhere('audit.departmentId IN (:...departmentIds)', {
        departmentIds: options.departmentIds
      });
    }

    if (options.startDate) {
      queryBuilder.andWhere('audit.createdAt >= :startDate', {
        startDate: options.startDate
      });
    }

    if (options.endDate) {
      queryBuilder.andWhere('audit.createdAt <= :endDate', {
        endDate: options.endDate
      });
    }

    return queryBuilder
      .orderBy('audit.createdAt', 'DESC')
      .take(options.limit || 50)
      .skip(options.offset || 0)
      .getManyAndCount();
  }

  /**
   * Compare and generate changes object
   */
  compareChanges(
    oldData: Record<string, any>,
    newData: Record<string, any>
  ): Record<string, ChangeRecord> {
    const changes: Record<string, ChangeRecord> = {};

    for (const key of Object.keys(newData)) {
      if (
        oldData[key] !== undefined &&
        JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])
      ) {
        changes[key] = {
          old: oldData[key],
          new: newData[key]
        };
      }
    }

    return changes;
  }

  /**
   * Clean up old audit logs
   */
  async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}