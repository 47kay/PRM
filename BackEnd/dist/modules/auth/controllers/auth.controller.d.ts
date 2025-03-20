import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { User } from '../../users/entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, userAgent: string, ip: string): Promise<{
        user: {
            id: any;
            email: any;
            role: any;
            organizationId: string;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    register(registerDto: RegisterDto, userAgent: string, ip: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("../../users/enums/role.enum").Role;
            organizationId: string;
        };
        organization: {
            id: string;
            name: string;
            status: import("../../organizations/entities/organization.entity").OrganizationStatus;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        tokens: {
            accessToken: string;
        };
    }>;
    logout(user: User, authHeader: string): Promise<{
        message: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getCurrentUser(user: User): Promise<{
        user: User;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    resendVerification(user: User): Promise<{
        message: string;
    }>;
}
