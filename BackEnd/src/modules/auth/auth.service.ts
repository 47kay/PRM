// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

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

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['organization'],
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify organization status and subscription
    const organization = await this.organizationRepository.findOne({
      where: { id: user.organization.id },
    });

    if (!organization.isActive) {
      throw new UnauthorizedException('Organization is inactive');
    }

    if (!organization.isSubscriptionActive) {
      throw new UnauthorizedException('Organization subscription has expired');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization.id,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(user.id),
    ]);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organization.id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: registerDto.email },
        { username: registerDto.username },
      ],
    });

    if (existingUser) {
      throw new UnauthorizedException(
        existingUser.email === registerDto.email
          ? 'Email already registered'
          : 'Username already taken'
      );
    }

    const hashedPassword = await hash(registerDto.password, 12);
    
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: 'STANDARD_USER',
    });

    await this.userRepository.save(user);

    const { password: _, ...result } = user;
    return result;
  }

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.sign(payload);
  }

  private async generateRefreshToken(userId: number): Promise<RefreshToken> {
    const token = this.refreshTokenRepository.create({
      user: { id: userId },
      token: await hash(Date.now().toString(), 8), // Generate unique token
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return this.refreshTokenRepository.save(token);
  }

  async refreshToken(refreshToken: string) {
    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user', 'user.organization'],
    });

    if (!tokenEntity || tokenEntity.isExpired()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const payload: JwtPayload = {
      sub: tokenEntity.user.id,
      email: tokenEntity.user.email,
      role: tokenEntity.user.role,
      organizationId: tokenEntity.user.organization.id,
    };

    const accessToken = await this.generateAccessToken(payload);
    return { accessToken };
  }

  async logout(userId: number): Promise<void> {
    await this.refreshTokenRepository.delete({ user: { id: userId } });
  }

  async validateOrganizationAccess(userId: number, organizationId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });

    return user?.organization?.id === organizationId;
  }
}