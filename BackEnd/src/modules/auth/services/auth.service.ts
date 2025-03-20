// src/modules/auth/services/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { compare, hash } from 'bcrypt';
import { Organization, OrganizationStatus } from '../../organizations/entities/organization.entity';
import { Role } from '../../users/enums/role.enum';
import { JwtPayload } from '../../../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/services/users.service';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

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
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * Checks if a token has been blacklisted
   * @param token The JWT token to check
   * @returns boolean True if the token is blacklisted, false otherwise
   */
  isTokenBlacklisted(token: string): boolean {
    // In a real implementation, you would:
    // 1. Either check a cache (Redis) or database table for blacklisted tokens
    // 2. Or verify against a token revocation list
    
    // For now, return false as a placeholder
    // You can implement token blacklisting using the refresh token repository
    // by checking if there's a revoked token matching this one
    
    // Example implementation (uncomment and adapt when you have the proper setup):
    /*
    try {
      const decodedToken = this.jwtService.decode(token) as JwtPayload;
      if (!decodedToken || !decodedToken.sessionId) {
        return false;
      }
      
      // Check if a refresh token with this session ID has been revoked
      const revokedToken = this.refreshTokenRepository.findOne({
        where: {
          sessionId: decodedToken.sessionId,
          isRevoked: true
        }
      });
      
      return !!revokedToken;
    } catch (error) {
      // If we can't decode the token, assume it's not blacklisted
      return false;
    }
    */
    
    return false;
  }

  /**
   * Determines if email verification is required
   * @returns boolean True if email verification is required, false otherwise
   */
  get requireEmailVerification(): boolean {
    // Read this from your application config
    // You might want different settings for different environments
    const requireVerification = this.configService?.get<boolean>('EMAIL_VERIFICATION_REQUIRED') ?? true;
    return requireVerification;
  }

  async checkOrganizationAccess(userId: string, organizationId: string): Promise<boolean> {
    // Check if the user has access to the organization
    const user = await this.usersService.findById(userId);
    return user?.organizationId === organizationId;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    // Implement the logic to get user permissions
    // This is a placeholder implementation
    return ['permission1', 'permission2'];
  }

  async checkResourceOwnership(userId: string, resourceId: string, resourceType: string): Promise<boolean> {
    // Implement the logic to check resource ownership
    // For example, query the database to verify ownership
    return true; // or false based on the check
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['organization'],
    });

    if (user && (await compare(password, user.password))) {
      // Use destructuring to exclude the password field
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto, metadata: { userAgent: string; ip: string }) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify organization subscription status
    const organization = await this.organizationRepository.findOne({
      where: { id: user.organization?.id },
    });

    if (!organization) {
      throw new UnauthorizedException('Organization not found');
    }

    if (!organization.isSubscriptionActive) {
      throw new UnauthorizedException('Organization subscription is inactive');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: organization.id,
      permissions: [],
      sessionId: uuidv4(),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id, metadata);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: organization.id,
      },
    };
  }

  async register(registerDto: RegisterDto, metadata: { userAgent: string; ip: string }) {
    // Check if user with the same email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.user.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    // Create organization first
    const organization = new Organization();
    organization.name = registerDto.organization.name;
    organization.status = OrganizationStatus.ACTIVE;
    organization.isSubscriptionActive = true;

    if (registerDto.organization.website) {
      organization.website = registerDto.organization.website;
    }

    if (registerDto.organization.phone) {
      organization.contactInfo = {
        phone: registerDto.organization.phone
      };
    }

    if (registerDto.organization.address) {
      organization.contactInfo = {
        ...organization.contactInfo,
        address: {
          street: registerDto.organization.address.street,
          city: registerDto.organization.address.city,
          state: registerDto.organization.address.state,
          postalCode: registerDto.organization.address.postalCode,
          country: registerDto.organization.address.country,
        },
      };
    }

    // Generate a slug from the organization name
    organization.slug = this.generateSlug(registerDto.organization.name);

    const savedOrganization = await this.organizationRepository.save(organization);

    // Hash the password
    const hashedPassword = await hash(registerDto.user.password, 10);

    // Create the user
    const user = new User();
    user.firstName = registerDto.user.firstName;
    user.lastName = registerDto.user.lastName;
    user.email = registerDto.user.email;
    user.password = hashedPassword;
    user.role = registerDto.user.role || Role.ADMIN; // Default role for first user
    user.organizationId = savedOrganization.id;
    user.createdById = savedOrganization.id; // Temporary, will be updated later

    if (registerDto.user.phone) {
      user.phoneNumber = registerDto.user.phone;
    }

    const savedUser = await this.userRepository.save(user);

    // Update the organization's createdById to point to the user
    savedOrganization.createdById = savedUser.id;
    await this.organizationRepository.save(savedOrganization);

    // Generate tokens
    const payload: JwtPayload = {
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
      organizationId: savedOrganization.id,
      permissions: [],
      sessionId: uuidv4(),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(savedUser.id, metadata);

    // Return response without exposing password
    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        organizationId: savedOrganization.id,
      },
      organization: {
        id: savedOrganization.id,
        name: savedOrganization.name,
        status: savedOrganization.status,
      },
    };
  }

  async refreshToken(token: string) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!refreshToken || refreshToken.isExpired() || refreshToken.isRevoked) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Update last used timestamp
    refreshToken.updateLastUsed();
    await this.refreshTokenRepository.save(refreshToken);

    const user = await this.userRepository.findOne({
      where: { id: refreshToken.userId }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload: JwtPayload = {
      sub: refreshToken.userId,
      email: user.email,
      role: user.role,
      organizationId: refreshToken.organizationId || user.organizationId,
      permissions: [],
      sessionId: uuidv4(),
    };

    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  private async generateRefreshToken(userId: string, metadata: { userAgent: string; ip: string }): Promise<RefreshToken> {
    // Create a unique token string
    const tokenString = uuidv4();

    // Get the user to access the organization ID
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Create the refresh token entity
    const token = new RefreshToken();
    token.userId = userId;
    token.organizationId = user.organizationId;
    token.token = tokenString;
    token.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    token.userAgent = metadata.userAgent;
    token.ipAddress = metadata.ip;
    token.metadata = {
      platform: this.extractPlatform(metadata.userAgent),
      browser: this.extractBrowser(metadata.userAgent),
      lastUsed: new Date(),
    };

    return this.refreshTokenRepository.save(token);
  }

  async logout(userId: string) {
    await this.refreshTokenRepository.update(
      { userId },
      { isRevoked: true, revokedAt: new Date(), revokedReason: 'User logout' }
    );
    return { message: 'Logged out successfully' };
  }

  async validateOrganizationAccess(userId: string, organizationId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });

    return user?.organizationId === organizationId;
  }

  // Helper methods
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 50) + '-' + Math.floor(Math.random() * 10000);
  }

  private extractPlatform(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('Linux')) return 'Linux';
    return 'Unknown';
  }

  private extractBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
    return 'Unknown';
  }

  // Password reset methods
  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists for security
      return;
    }

    // Generate reset token, save it, and send email logic would go here
    // This is a placeholder implementation
  }

  async changePassword(token: string, newPassword: string): Promise<void> {
    // Validate token and update password logic would go here
    // This is a placeholder implementation
  }

  // Email verification methods
  async confirmEmail(token: string): Promise<void> {
    // Validate token and confirm email logic would go here
    // This is a placeholder implementation
  }

  async sendVerificationEmail(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate verification token, save it, and send email logic would go here
    // This is a placeholder implementation
  }
}