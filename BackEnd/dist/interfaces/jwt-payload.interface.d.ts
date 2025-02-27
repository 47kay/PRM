import { Role } from '../modules/users/enums/role.enum';
export interface JwtPayload {
    sub: string;
    email: string;
    role: Role;
    organizationId?: string;
    permissions: string[];
    sessionId: string;
    deviceId?: string;
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string;
}
export interface RefreshTokenPayload {
    jti: string;
    sub: string;
    sessionId: string;
    deviceId?: string;
    iat?: number;
    exp?: number;
}
export interface DecodedToken extends JwtPayload {
    iat: number;
    exp: number;
    iss: string;
    aud: string;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface TokenMetadata {
    userId: string;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
    isRevoked: boolean;
    revokedAt?: Date;
    revokedReason?: string;
}
