export declare class LoginDto {
    email: string;
    password: string;
    rememberMe?: boolean;
    organizationId?: string;
    deviceId?: string;
}
export interface LoginResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        organizationId?: string;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    };
    organization?: {
        id: string;
        name: string;
        status: string;
    };
}
export interface LoginMetadata {
    userAgent: string;
    ip: string;
    deviceId?: string;
    lastLogin?: Date;
    loginAttempts?: number;
}
