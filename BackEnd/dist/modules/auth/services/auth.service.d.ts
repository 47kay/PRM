import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { Organization, OrganizationStatus } from '../../organizations/entities/organization.entity';
import { Role } from '../../users/enums/role.enum';
import { UsersService } from '../../users/services/users.service';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private readonly userRepository;
    private readonly refreshTokenRepository;
    private readonly organizationRepository;
    private readonly jwtService;
    private readonly usersService;
    private readonly configService;
    constructor(userRepository: Repository<User>, refreshTokenRepository: Repository<RefreshToken>, organizationRepository: Repository<Organization>, jwtService: JwtService, usersService: UsersService, configService: ConfigService);
    isTokenBlacklisted(token: string): boolean;
    get requireEmailVerification(): boolean;
    checkOrganizationAccess(userId: string, organizationId: string): Promise<boolean>;
    getUserPermissions(userId: string): Promise<string[]>;
    checkResourceOwnership(userId: string, resourceId: string, resourceType: string): Promise<boolean>;
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto, metadata: {
        userAgent: string;
        ip: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            role: any;
            organizationId: string;
        };
    }>;
    register(registerDto: RegisterDto, metadata: {
        userAgent: string;
        ip: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: Role;
            organizationId: string;
        };
        organization: {
            id: string;
            name: string;
            status: OrganizationStatus;
        };
    }>;
    refreshToken(token: string): Promise<{
        accessToken: string;
    }>;
    private generateRefreshToken;
    logout(userId: string): Promise<{
        message: string;
    }>;
    validateOrganizationAccess(userId: string, organizationId: string): Promise<boolean>;
    private generateSlug;
    private extractPlatform;
    private extractBrowser;
    sendPasswordResetEmail(email: string): Promise<void>;
    changePassword(token: string, newPassword: string): Promise<void>;
    confirmEmail(token: string): Promise<void>;
    sendVerificationEmail(userId: string): Promise<void>;
}
