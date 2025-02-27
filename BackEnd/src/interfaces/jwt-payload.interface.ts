// src/interfaces/jwt-payload.interface.ts

import { Role } from '../modules/users/enums/role.enum';

export interface JwtPayload {
    sub: string;               // User ID
    email: string;            // User email
    role: Role;               // User role
    organizationId?: string;  // Organization ID (optional for super admin)
    permissions: string[];    // User permissions
    sessionId: string;        // Unique session identifier
    deviceId?: string;        // Device identifier (optional)
    iat?: number;            // Issued at timestamp
    exp?: number;            // Expiration timestamp
    iss?: string;            // Token issuer
    aud?: string;            // Token audience
}

export interface RefreshTokenPayload {
    jti: string;             // JWT ID (unique identifier for refresh token)
    sub: string;             // User ID
    sessionId: string;       // Session identifier
    deviceId?: string;       // Device identifier
    iat?: number;           // Issued at timestamp
    exp?: number;           // Expiration timestamp
}

export interface DecodedToken extends JwtPayload {
    iat: number;            // Issued at timestamp
    exp: number;            // Expiration timestamp
    iss: string;           // Token issuer
    aud: string;           // Token audience
}

// Additional interfaces for token management
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

// Example usage of interfaces:
/*
// Creating a JWT payload
const createJwtPayload = (user: User, sessionId: string): JwtPayload => ({
    sub: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    permissions: user.permissions,
    sessionId,
    deviceId: generateDeviceId(),
});

// Creating a refresh token payload
const createRefreshTokenPayload = (
    userId: string, 
    sessionId: string
): RefreshTokenPayload => ({
    jti: generateUuid(),
    sub: userId,
    sessionId,
    deviceId: generateDeviceId(),
});

// Token verification result
interface TokenVerificationResult {
    isValid: boolean;
    decoded?: DecodedToken;
    error?: string;
}
*/