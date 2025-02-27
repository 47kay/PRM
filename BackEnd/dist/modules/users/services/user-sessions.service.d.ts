import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserSession } from '../entities/user-session.entity';
import { User } from '../entities/user.entity';
export declare class UserSessionsService {
    private readonly sessionRepository;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    private readonly parser;
    constructor(sessionRepository: Repository<UserSession>, jwtService: JwtService, configService: ConfigService);
    createSession(user: User, token: string, request: Request, options?: {
        isRemembered?: boolean;
        deviceId?: string;
        metadata?: Record<string, any>;
    }): Promise<UserSession>;
    validateSession(token: string): Promise<UserSession | null>;
    updateLastActivity(sessionId: string): Promise<void>;
    getUserActiveSessions(userId: string): Promise<UserSession[]>;
    revokeSession(sessionId: string, revokedBy: string, reason?: string): Promise<void>;
    revokeAllUserSessions(userId: string, revokedBy: string, reason?: string): Promise<void>;
    extendSession(sessionId: string): Promise<void>;
    cleanupExpiredSessions(): Promise<number>;
    private parseUserAgent;
    private expireSession;
}
