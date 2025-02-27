import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
  LOGGED_OUT = 'LOGGED_OUT'
}

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid', { nullable: true })
  organizationId: string;

  @Column({ unique: true })
  @Index()
  token: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE
  })
  status: SessionStatus;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ nullable: true })
  lastActivityAt: Date;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  deviceId: string;

  @Column({ nullable: true })
  deviceType: string;

  @Column({ nullable: true })
  browser: string;

  @Column({ nullable: true })
  operatingSystem: string;

  @Column({ nullable: true })
  location: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column({ default: false })
  isMobile: boolean;

  @Column({ default: false })
  isRemembered: boolean;

  @Column({ nullable: true })
  revokedAt: Date;

  @Column('uuid', { nullable: true })
  revokedBy: string;

  @Column({ nullable: true })
  revokedReason: string;

  @Column({ default: 0 })
  tokenRotationCount: number;

  @Column({ nullable: true })
  lastTokenRotation: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Check if session is expired
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Check if session is active
   */
  isActive(): boolean {
    return (
      this.status === SessionStatus.ACTIVE &&
      !this.isExpired()
    );
  }

  /**
   * Check if session can be extended
   */
  canBeExtended(): boolean {
    return (
      this.isActive() &&
      this.isRemembered &&
      this.tokenRotationCount < 10
    );
  }

  /**
   * Check if session requires rotation
   */
  requiresRotation(): boolean {
    if (!this.lastTokenRotation) {
      return false;
    }

    const rotationThreshold = 24 * 60 * 60 * 1000; // 24 hours
    const timeSinceLastRotation = Date.now() - this.lastTokenRotation.getTime();
    
    return timeSinceLastRotation >= rotationThreshold;
  }

  /**
   * Extend session expiry
   */
  extend(duration: number): void {
    if (!this.canBeExtended()) {
      throw new Error('Session cannot be extended');
    }

    const newExpiryDate = new Date();
    newExpiryDate.setTime(newExpiryDate.getTime() + duration);
    
    this.expiresAt = newExpiryDate;
    this.tokenRotationCount += 1;
    this.lastTokenRotation = new Date();
  }

  /**
   * Update last activity
   */
  updateActivity(): void {
    this.lastActivityAt = new Date();
  }

  /**
   * Revoke session
   */
  revoke(revokedBy: string, reason: string = ''): void {
    this.status = SessionStatus.REVOKED;
    this.revokedAt = new Date();
    this.revokedBy = revokedBy;
    this.revokedReason = reason;
  }

  /**
   * Mark session as logged out
   */
  logout(): void {
    this.status = SessionStatus.LOGGED_OUT;
  }

  /**
   * Check if session is from same IP
   */
  isSameIp(ip: string): boolean {
    return this.ipAddress === ip;
  }

  /**
   * Check if session is from same device
   */
  isSameDevice(deviceId: string): boolean {
    return this.deviceId === deviceId;
  }
}