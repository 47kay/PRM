import { User } from '../../users/entities/user.entity';
export declare class RefreshToken {
    id: string;
    userId: string;
    organizationId: string;
    token: string;
    expiresAt: Date;
    isRevoked: boolean;
    deviceId: string;
    userAgent: string;
    ipAddress: string;
    metadata: {
        platform?: string;
        browser?: string;
        location?: string;
        lastUsed?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
    revokedAt: Date;
    revokedBy: string;
    revokedReason: string;
    user: User;
    isExpired(): boolean;
    isValid(): boolean;
    revoke(userId: string, reason: string): void;
    updateLastUsed(): void;
}
