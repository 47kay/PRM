import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserSession, SessionStatus } from '../entities/user-session.entity';
import { User } from '../entities/user.entity';
import * as UAParser from 'ua-parser-js';

@Injectable()
export class UserSessionsService {
  private readonly logger = new Logger(UserSessionsService.name);
  private readonly parser: UAParser.UAParser;

  constructor(
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.parser = new UAParser.UAParser();
  }

  /**
   * Create new user session
   */
  async createSession(
    user: User,
    token: string,
    request: Request,
    options: {
      isRemembered?: boolean;
      deviceId?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<UserSession> {
    try {
      // Parse user agent info
      const deviceInfo = this.parseUserAgent(request.headers['user-agent']);

      // Get token expiration from payload
      const payload = this.jwtService.decode(token);
      const expiresAt = new Date(payload['exp'] * 1000);

      const session = this.sessionRepository.create({
        userId: user.id,
        organizationId: user.organizationId,
        token,
        status: SessionStatus.ACTIVE,
        expiresAt,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] as string,
        deviceId: options.deviceId,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        operatingSystem: deviceInfo.os,
        isMobile: deviceInfo.isMobile,
        isRemembered: options.isRemembered || false,
        metadata: options.metadata,
        lastActivityAt: new Date(),
      });

      return this.sessionRepository.save(session);
    } catch (error) {
      this.logger.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Validate session
   */
  async validateSession(token: string): Promise<UserSession | null> {
    try {
      const session = await this.sessionRepository.findOne({
        where: { token }
      });

      if (!session) {
        return null;
      }

      if (session.status !== SessionStatus.ACTIVE) {
        return null;
      }

      if (session.isExpired()) {
        await this.expireSession(session.id);
        return null;
      }

      return session;
    } catch (error) {
      this.logger.error('Error validating session:', error);
      return null;
    }
  }

  /**
   * Update session last activity
   */
  async updateLastActivity(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      lastActivityAt: new Date()
    });
  }

  /**
   * Get active sessions for user
   */
  async getUserActiveSessions(userId: string): Promise<UserSession[]> {
    return this.sessionRepository.find({
      where: {
        userId,
        status: SessionStatus.ACTIVE,
        expiresAt: LessThan(new Date())
      },
      order: {
        lastActivityAt: 'DESC'
      }
    });
  }

  /**
   * Revoke session
   */
  async revokeSession(
    sessionId: string,
    revokedBy: string,
    reason?: string
  ): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId }
    });

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new UnauthorizedException('Session is not active');
    }

    session.revoke(revokedBy, reason);
    await this.sessionRepository.save(session);
  }

  /**
   * Revoke all user sessions
   */
  async revokeAllUserSessions(
    userId: string,
    revokedBy: string,
    reason?: string
  ): Promise<void> {
    const sessions = await this.getUserActiveSessions(userId);

    for (const session of sessions) {
      session.revoke(revokedBy, reason);
    }

    await this.sessionRepository.save(sessions);
  }

  /**
   * Extend session
   */
  async extendSession(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId }
    });

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (!session.canBeExtended()) {
      throw new UnauthorizedException('Session cannot be extended');
    }

    // Extend for 24 hours
    const extensionDuration = 24 * 60 * 60 * 1000;
    session.extend(extensionDuration);

    await this.sessionRepository.save(session);
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await this.sessionRepository
        .createQueryBuilder()
        .update()
        .set({ status: SessionStatus.EXPIRED })
        .where('status = :status', { status: SessionStatus.ACTIVE })
        .andWhere('expiresAt <= :now', { now: new Date() })
        .execute();

      return result.affected || 0;
    } catch (error) {
      this.logger.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }

  /**
   * Parse user agent string
   */
  private parseUserAgent(userAgent?: string): {
    browser: string;
    os: string;
    deviceType: string;
    isMobile: boolean;
  } {
    if (!userAgent) {
      return {
        browser: 'unknown',
        os: 'unknown',
        deviceType: 'unknown',
        isMobile: false
      };
    }

    this.parser.setUA(userAgent);
    const result = this.parser.getResult();

    return {
      browser: `${result.browser.name || ''} ${result.browser.version || ''}`.trim() || 'unknown',
      os: `${result.os.name || ''} ${result.os.version || ''}`.trim() || 'unknown',
      deviceType: result.device.type || 'desktop',
      isMobile: result.device.type === 'mobile' || result.device.type === 'tablet'
    };
  }

  /**
   * Expire session
   */
  private async expireSession(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      status: SessionStatus.EXPIRED
    });
  }
}