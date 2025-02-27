import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { Organization } from '../../organizations/entities/organization.entity';
export declare class AuthService {
    private readonly userRepository;
    private readonly refreshTokenRepository;
    private readonly organizationRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, refreshTokenRepository: Repository<RefreshToken>, organizationRepository: Repository<Organization>, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            role: any;
            organizationId: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<User>;
    refreshAccessToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    private generateRefreshToken;
    logout(userId: number): Promise<{
        message: string;
    }>;
    validateOrganizationAccess(userId: number, organizationId: number): Promise<boolean>;
}
