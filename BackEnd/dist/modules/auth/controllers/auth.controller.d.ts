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
            organizationId: any;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    register(registerDto: RegisterDto, userAgent: string, ip: string): Promise<{
        user: any;
        organization: any;
        tokens: {
            accessToken: any;
            refreshToken: any;
        };
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        tokens: any;
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
