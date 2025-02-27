import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { AuditLog } from '../../modules/audit/entities/audit-log.entity';
import { User } from '../../modules/users/entities/user.entity';

export interface AuditLogDto {
  action: string;
  entityType: string;
  entityId: string | number;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  userId?: string | number;
  organizationId?: string | number;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>
  ) {}

  /**
   * Create a new audit log entry
   */
  async log(dto: AuditLogDto, request?: Request): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      action: dto.action,
      entityType: dto.entityType,
      entityId: dto.entityId.toString(),
      changes: dto.changes || {},
      metadata: {
        ...dto.metadata,
        ipAddress: dto.ipAddress || request?.ip,
        userAgent: dto.userAgent || request?.headers['user-agent'],
        timestamp: new Date(),
      },
      userId: dto.userId?.toString(),
      organizationId: dto.organizationId?.toString(),
    });

    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityAuditLogs(
    entityType: string,
    entityId: string | number,
    options: {
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
      actions?: string[];
    } = {}
  ): Promise<[AuditLog[], number]> {
    const query = this.auditLogRepository
      .createQueryBuilder('audit_log')
      .where('audit_log.entityType = :entityType', { entityType })
      .andWhere('audit_log.entityId = :entityId', { entityId: entityId.toString() });

    if (options.startDate) {
      query.andWhere('audit_log.createdAt >= :startDate', { startDate: options.startDate });
    }

    if (options.endDate) {
      query.andWhere('audit_log.createdAt <= :endDate', { endDate: options.endDate });
    }

    if (options.actions?.length) {
      query.andWhere('audit_log.action IN (:...actions)', { actions: options.actions });
    }

    query
      .orderBy('audit_log.createdAt', 'DESC')
      .skip(options.offset || 0)
      .take(options.limit || 50);

    return query.getManyAndCount();
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLogs(
    userId: string | number,
    options: {
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
      actions?: string[];
      entityTypes?: string[];
    } = {}
  ): Promise<[AuditLog[], number]> {
    const query = this.auditLogRepository
      .createQueryBuilder('audit_log')
      .where('audit_log.userId = :userId', { userId: userId.toString() });

    if (options.startDate) {
      query.andWhere('audit_log.createdAt >= :startDate', { startDate: options.startDate });
    }

    if (options.endDate) {
      query.andWhere('audit_log.createdAt <= :endDate', { endDate: options.endDate });
    }

    if (options.actions?.length) {
      query.andWhere('audit_log.action IN (:...actions)', { actions: options.actions });
    }

    if (options.entityTypes?.length) {
      query.andWhere('audit_log.entityType IN (:...entityTypes)', { entityTypes: options.entityTypes });
    }

    query
      .orderBy('audit_log.createdAt', 'DESC')
      .skip(options.offset || 0)
      .take(options.limit || 50);

    return query.getManyAndCount();
  }

  /**
   * Get audit logs for an organization
   */
  async getOrganizationAuditLogs(
    organizationId: string | number,
    options: {
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
      actions?: string[];
      entityTypes?: string[];
      userIds?: (string | number)[];
    } = {}
  ): Promise<[AuditLog[], number]> {
    const query = this.auditLogRepository
      .createQueryBuilder('audit_log')
      .where('audit_log.organizationId = :organizationId', { organizationId: organizationId.toString() });

    if (options.startDate) {
      query.andWhere('audit_log.createdAt >= :startDate', { startDate: options.startDate });
    }

    if (options.endDate) {
      query.andWhere('audit_log.createdAt <= :endDate', { endDate: options.endDate });
    }

    if (options.actions?.length) {
      query.andWhere('audit_log.action IN (:...actions)', { actions: options.actions });
    }

    if (options.entityTypes?.length) {
      query.andWhere('audit_log.entityType IN (:...entityTypes)', { entityTypes: options.entityTypes });
    }

    if (options.userIds?.length) {
      query.andWhere('audit_log.userId IN (:...userIds)', { 
        userIds: options.userIds.map(id => id.toString()) 
      });
    }

    query
      .orderBy('audit_log.createdAt', 'DESC')
      .skip(options.offset || 0)
      .take(options.limit || 50);

    return query.getManyAndCount();
  }

  /**
   * Clean up old audit logs
   */
  async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
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