// src/modules/auth/controllers/auth.controller.ts

import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Get,
    UseGuards,
    Req,
    Headers,
    Ip,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { User } from '../../users/entities/user.entity';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { RateLimitGuard } from '../guards/rate-limit.guard';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(RateLimitGuard)
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
    async login(
        @Body() loginDto: LoginDto,
        @Headers('user-agent') userAgent: string,
        @Ip() ip: string,
    ) {
        const result = await this.authService.login(loginDto, {
            userAgent,
            ip,
        });

        return {
            user: result.user,
            tokens: {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            },
        };
    }

    @Post('register')
    @Public()
    @ApiOperation({ summary: 'Register new user/organization' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Registration successful' })
    async register(
        @Body() registerDto: RegisterDto,
        @Headers('user-agent') userAgent: string,
        @Ip() ip: string,
    ) {
        const result = await this.authService.register(registerDto, {
            userAgent,
            ip,
        });

        return {
            user: result.user,
            organization: result.organization,
            tokens: {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            },
        };
    }

    @Post('refresh-token')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        const tokens = await this.authService.refreshToken(refreshTokenDto.refreshToken);
        return { tokens };
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'User logout' })
    async logout(
        @CurrentUser() user: User,
        @Headers('authorization') authHeader: string,
    ) {
        const token = authHeader?.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Invalid token');
        }

        // Fixed: Passing only one argument as expected
        await this.authService.logout(user.id);
        return { message: 'Logout successful' };
    }

    @Post('forgot-password')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Request password reset' })
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        // Assuming the service has a method to handle this
        // If not implemented, you'll need to add this method to your AuthService
        await this.authService.sendPasswordResetEmail(forgotPasswordDto.email);
        return { message: 'Password reset instructions sent to email' };
    }

    @Post('reset-password')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reset password' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        // Assuming the service has a method to handle this
        // If not implemented, you'll need to add this method to your AuthService
        await this.authService.changePassword(
            resetPasswordDto.token,
            resetPasswordDto.password,
        );
        return { message: 'Password reset successful' };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    async getCurrentUser(@CurrentUser() user: User) {
        return { user };
    }

    @Post('verify-email')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify email address' })
    async verifyEmail(@Body('token') token: string) {
        // Assuming the service has a method to handle this
        // If not implemented, you'll need to add this method to your AuthService
        await this.authService.confirmEmail(token);
        return { message: 'Email verification successful' };
    }

    @Post('resend-verification')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Resend verification email' })
    async resendVerification(@CurrentUser() user: User) {
        // Assuming the service has a method to handle this
        // If not implemented, you'll need to add this method to your AuthService
        await this.authService.sendVerificationEmail(user.id);
        return { message: 'Verification email sent' };
    }
}