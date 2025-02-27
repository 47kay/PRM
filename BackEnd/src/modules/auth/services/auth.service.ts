import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { compare, hash } from 'bcrypt';
import { Organization } from '../../organizations/entities/organization.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['organization'],
    });

    if (user && (await compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify organization subscription status
    const organization = await this.organizationRepository.findOne({
      where: { id: user.organization.id },
    });

    if (!organization.isSubscriptionActive) {
      throw new UnauthorizedException('Organization subscription is inactive');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization.id,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organization.id,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    const hashedPassword = await hash(registerDto.password, 10);
    
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: 'STANDARD_USER', // Default role
    });

    await this.userRepository.save(user);

    const { password, ...result } = user;
    return result;
  }

  async refreshAccessToken(refreshToken: string) {
    const token = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!token || token.isExpired()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = {
      sub: token.user.id,
      email: token.user.email,
      role: token.user.role,
      organizationId: token.user.organization.id,
    };

    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  private async generateRefreshToken(userId: number): Promise<RefreshToken> {
    const token = this.refreshTokenRepository.create({
      user: { id: userId },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return this.refreshTokenRepository.save(token);
  }

  async logout(userId: number) {
    await this.refreshTokenRepository.delete({ user: { id: userId } });
    return { message: 'Logged out successfully' };
  }

  async validateOrganizationAccess(userId: number, organizationId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });

    return user?.organization?.id === organizationId;
  }
}