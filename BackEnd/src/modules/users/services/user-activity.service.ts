import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActivity } from '../entities/user-activity.entity';
import { User } from '../entities/user.entity';

export enum ActivityType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  API_ACCESS = 'API_ACCESS',
  SETTINGS_CHANGE = 'SETTINGS_CHANGE',
  ROLE_CHANGE = 'ROLE_CHANGE',
  DEPARTMENT_ASSIGNMENT = 'DEPARTMENT_ASSIGNMENT',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  EXPORT_DATA = 'EXPORT_DATA',
  BULK_ACTION = 'BULK_ACTION'
}

interface ActivityOptions {
  userId: string;
  organizationId?: string;
  type: ActivityType;
  description?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  status?: 'SUCCESS' | 'FAILURE';
  failureReason?: string;
}

@Injectable()
export class UserActivityService {
  private readonly logger = new Logger(UserActivityService.name);

  constructor(
    @InjectRepository(UserActivity)
    private readonly activityRepository: Repository<UserActivity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  /**
   * Log user activity
   */
  async logActivity(options: ActivityOptions): Promise<UserActivity> {
    try {
      const activity = this.activityRepository.create({
        userId: options.userId,
        organizationId: options.organizationId,
        type: options.type,
        description: options.description,
        metadata: options.metadata,
        ipAddress: options.ip,
        userAgent: options.userAgent,
        referrer: options.referrer,
        status: options.status || 'SUCCESS',
        failureReason: options.failureReason
      });

      const savedActivity = await this.activityRepository.save(activity);
      return Array.isArray(savedActivity) ? savedActivity[0] : savedActivity;
    } catch (error) {
      this.logger.error(`Failed to log activity for user ${options.userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user activity history
   */
  async getUserActivity(
    userId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      types?: ActivityType[];
      status?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<[UserActivity[], number]> {
    const queryBuilder = this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.userId = :userId', { userId })
      .orderBy('activity.createdAt', 'DESC');

    if (options.startDate) {
      queryBuilder.andWhere('activity.createdAt >= :startDate', {
        startDate: options.startDate
      });
    }

    if (options.endDate) {
      queryBuilder.andWhere('activity.createdAt <= :endDate', {
        endDate: options.endDate
      });
    }

    if (options.types?.length) {
      queryBuilder.andWhere('activity.type IN (:...types)', {
        types: options.types
      });
    }

    if (options.status) {
      queryBuilder.andWhere('activity.status = :status', {
        status: options.status
      });
    }

    return queryBuilder
      .take(options.limit || 50)
      .skip(options.offset || 0)
      .getManyAndCount();
  }

  /**
   * Get organization user activity
   */
  async getOrganizationActivity(
    organizationId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      types?: ActivityType[];
      userIds?: string[];
      status?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<[UserActivity[], number]> {
    const queryBuilder = this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.organizationId = :organizationId', { organizationId })
      .orderBy('activity.createdAt', 'DESC');

    if (options.startDate) {
      queryBuilder.andWhere('activity.createdAt >= :startDate', {
        startDate: options.startDate
      });
    }

    if (options.endDate) {
      queryBuilder.andWhere('activity.createdAt <= :endDate', {
        endDate: options.endDate
      });
    }

    if (options.types?.length) {
      queryBuilder.andWhere('activity.type IN (:...types)', {
        types: options.types
      });
    }

    if (options.userIds?.length) {
      queryBuilder.andWhere('activity.userId IN (:...userIds)', {
        userIds: options.userIds
      });
    }

    if (options.status) {
      queryBuilder.andWhere('activity.status = :status', {
        status: options.status
      });
    }

    return queryBuilder
      .take(options.limit || 50)
      .skip(options.offset || 0)
      .getManyAndCount();
  }

  /**
   * Get activity summary for a user
   */
  async getUserActivitySummary(
    userId: string,
    days: number = 30
  ): Promise<Record<string, number>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await this.activityRepository
      .createQueryBuilder('activity')
      .select('activity.type')
      .addSelect('COUNT(*)', 'count')
      .where('activity.userId = :userId', { userId })
      .andWhere('activity.createdAt >= :startDate', { startDate })
      .groupBy('activity.type')
      .getRawMany();

    return activities.reduce((acc, curr) => {
      acc[curr.activity_type] = parseInt(curr.count);
      return acc;
    }, {});
  }

  /**
   * Get most active users in organization
   */
  async getMostActiveUsers(
    organizationId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    } = {}
  ): Promise<Array<{ userId: string; count: number }>> {
    const queryBuilder = this.activityRepository
      .createQueryBuilder('activity')
      .select('activity.userId')
      .addSelect('COUNT(*)', 'count')
      .where('activity.organizationId = :organizationId', { organizationId });

    if (options.startDate) {
      queryBuilder.andWhere('activity.createdAt >= :startDate', {
        startDate: options.startDate
      });
    }

    if (options.endDate) {
      queryBuilder.andWhere('activity.createdAt <= :endDate', {
        endDate: options.endDate
      });
    }

    const results = await queryBuilder
      .groupBy('activity.userId')
      .orderBy('count', 'DESC')
      .limit(options.limit || 10)
      .getRawMany();

    return results.map(result => ({
      userId: result.activity_userId,
      count: parseInt(result.count)
    }));
  }

  /**
   * Clean up old activity logs
   */
  async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.activityRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}