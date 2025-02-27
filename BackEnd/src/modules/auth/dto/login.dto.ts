// src/modules/auth/dto/login.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsString,
    IsNotEmpty,
    MinLength,
    IsOptional,
    IsBoolean,
} from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: 'User email address',
        example: 'john.doe@example.com',
    })
    @IsEmail({}, { message: 'Please enter a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({
        description: 'User password',
        example: 'Password123!',
        minLength: 8,
    })
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @ApiPropertyOptional({
        description: 'Remember user session',
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    rememberMe?: boolean;

    @ApiPropertyOptional({
        description: 'Organization identifier for multi-tenant applications',
    })
    @IsOptional()
    @IsString()
    organizationId?: string;

    @ApiPropertyOptional({
        description: 'Device identifier for multi-device management',
    })
    @IsOptional()
    @IsString()
    deviceId?: string;
}

// Response interfaces
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