import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere, In, Like, LessThan } from 'typeorm';
import { OrganizationAuditLog } from '../entities/organization-audit-log.entity';

interface AuditEventData {
    organizationId: string;
    eventType: string;
    data: Record<string, any>;
    performedBy: string;
    timestamp?: Date;
    metadata?: Record<string, any>;
}

interface AuditQueryOptions {
    startDate?: Date;
    endDate?: Date;
    eventTypes?: string[];
    performedBy?: string;
    limit?: number;
    offset?: number;
}

@Injectable()
export class OrganizationAuditService {
    private readonly logger = new Logger(OrganizationAuditService.name);

    constructor(
        @InjectRepository(OrganizationAuditLog)
        private readonly auditLogRepository: Repository<OrganizationAuditLog>
    ) {}

    async logEvent(eventData: AuditEventData): Promise<OrganizationAuditLog> {
        try {
            const auditLog = this.auditLogRepository.create({
                organizationId: eventData.organizationId,
                eventType: eventData.eventType,
                data: this.sanitizeData(eventData.data),
                performedBy: eventData.performedBy,
                timestamp: eventData.timestamp || new Date(),
                metadata: eventData.metadata || {},
            });

            await this.auditLogRepository.save(auditLog);

            this.logger.debug(
                `Audit log created for ${eventData.eventType} in organization ${eventData.organizationId}`
            );

            return auditLog;
        } catch (error) {
            this.logger.error('Error creating audit log:', error);
            throw new Error(`Failed to create audit log: ${error.message}`);
        }
    }

    async getAuditLogs(
        organizationId: string,
        options: AuditQueryOptions = {}
    ): Promise<{ logs: OrganizationAuditLog[]; total: number }> {
        try {
            const where: FindOptionsWhere<OrganizationAuditLog> = {
                organizationId,
            };

            // Add date range filters if provided
            if (options.startDate || options.endDate) {
                where.timestamp = Between(
                    options.startDate || new Date(0),
                    options.endDate || new Date()
                );
            }

            // Add event type filter if provided
            if (options.eventTypes?.length) {
                where.eventType = In(options.eventTypes);
            }

            // Add performer filter if provided
            if (options.performedBy) {
                where.performedBy = options.performedBy;
            }

            const [logs, total] = await this.auditLogRepository.findAndCount({
                where,
                order: { timestamp: 'DESC' },
                take: options.limit || 50,
                skip: options.offset || 0,
            });

            return { logs, total };
        } catch (error) {
            this.logger.error('Error retrieving audit logs:', error);
            throw new Error(`Failed to retrieve audit logs: ${error.message}`);
        }
    }

    async getEventDetails(eventId: string): Promise<OrganizationAuditLog> {
        try {
            const auditLog = await this.auditLogRepository.findOne({
                where: { id: eventId }
            });

            if (!auditLog) {
                throw new Error(`Audit log with ID ${eventId} not found`);
            }

            return auditLog;
        } catch (error) {
            this.logger.error(`Error retrieving audit log details for ID ${eventId}:`, error);
            throw new Error(`Failed to retrieve audit log details: ${error.message}`);
        }
    }

    async getActivitySummary(
        organizationId: string,
        startDate: Date,
        endDate: Date
    ): Promise<Record<string, number>> {
        try {
            const logs = await this.auditLogRepository.find({
                where: {
                    organizationId,
                    timestamp: Between(startDate, endDate)
                }
            });

            // Group events by type and count occurrences
            return logs.reduce((summary, log) => {
                summary[log.eventType] = (summary[log.eventType] || 0) + 1;
                return summary;
            }, {} as Record<string, number>);
        } catch (error) {
            this.logger.error('Error generating activity summary:', error);
            throw new Error(`Failed to generate activity summary: ${error.message}`);
        }
    }

    async getUserActivity(
        organizationId: string,
        userId: string,
        options: AuditQueryOptions = {}
    ): Promise<OrganizationAuditLog[]> {
        try {
            const where: FindOptionsWhere<OrganizationAuditLog> = {
                organizationId,
                performedBy: userId,
            };

            if (options.startDate || options.endDate) {
                where.timestamp = Between(
                    options.startDate || new Date(0),
                    options.endDate || new Date()
                );
            }

            return await this.auditLogRepository.find({
                where,
                order: { timestamp: 'DESC' },
                take: options.limit || 50,
                skip: options.offset || 0,
            });
        } catch (error) {
            this.logger.error(`Error retrieving user activity for user ${userId}:`, error);
            throw new Error(`Failed to retrieve user activity: ${error.message}`);
        }
    }

    async getRecentChanges(
        organizationId: string,
        limit: number = 10
    ): Promise<OrganizationAuditLog[]> {
        try {
            return await this.auditLogRepository.find({
                where: {
                    organizationId,
                    eventType: Like('%updated%')
                },
                order: { timestamp: 'DESC' },
                take: limit,
            });
        } catch (error) {
            this.logger.error('Error retrieving recent changes:', error);
            throw new Error(`Failed to retrieve recent changes: ${error.message}`);
        }
    }

    private sanitizeData(data: Record<string, any>): Record<string, any> {
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'credential'];
        const sanitized = { ...data };

        // Recursively sanitize sensitive data
        const sanitizeObject = (obj: Record<string, any>) => {
            for (const [key, value] of Object.entries(obj)) {
                if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                    obj[key] = '[REDACTED]';
                } else if (typeof value === 'object' && value !== null) {
                    sanitizeObject(value);
                }
            }
        };

        sanitizeObject(sanitized);
        return sanitized;
    }

    async cleanupOldLogs(retentionDays: number): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

            const result = await this.auditLogRepository.delete({
                timestamp: LessThan(cutoffDate)
            });

            this.logger.debug(`Cleaned up ${result.affected} old audit logs`);
            return result.affected || 0;
        } catch (error) {
            this.logger.error('Error cleaning up old audit logs:', error);
            throw new Error(`Failed to clean up old audit logs: ${error.message}`);
        }
    }

    async exportAuditLogs(
        organizationId: string,
        startDate: Date,
        endDate: Date
    ): Promise<any> {
        try {
            const logs = await this.auditLogRepository.find({
                where: {
                    organizationId,
                    timestamp: Between(startDate, endDate)
                },
                order: { timestamp: 'ASC' }
            });

            // Format logs for export
            return logs.map(log => ({
                eventId: log.id,
                timestamp: log.timestamp.toISOString(),
                eventType: log.eventType,
                performedBy: log.performedBy,
                details: log.data,
                metadata: log.metadata
            }));
        } catch (error) {
            this.logger.error('Error exporting audit logs:', error);
            throw new Error(`Failed to export audit logs: ${error.message}`);
        }
    }
}