import { User } from './user.entity';
export declare enum SessionStatus {
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    REVOKED = "REVOKED",
    LOGGED_OUT = "LOGGED_OUT"
}
export declare class UserSession {
    id: string;
    userId: string;
    user: User;
    organizationId: string;
    token: string;
    refreshToken: string;
    status: SessionStatus;
    expiresAt: Date;
    lastActivityAt: Date;
    ipAddress: string;
    userAgent: string;
    deviceId: string;
    deviceType: string;
    browser: string;
    operatingSystem: string;
    location: string;
    metadata: Record<string, any>;
    isMobile: boolean;
    isRemembered: boolean;
    revokedAt: Date;
    revokedBy: string;
    revokedReason: string;
    tokenRotationCount: number;
    lastTokenRotation: Date;
    createdAt: Date;
    updatedAt: Date;
    isExpired(): boolean;
    isActive(): boolean;
    canBeExtended(): boolean;
    requiresRotation(): boolean;
    extend(duration: number): void;
    updateActivity(): void;
    revoke(revokedBy: string, reason?: string): void;
    logout(): void;
    isSameIp(ip: string): boolean;
    isSameDevice(deviceId: string): boolean;
}
