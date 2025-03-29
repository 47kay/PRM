import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { User } from '../../users/entities/user.entity';

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED'
}

@Entity('organization_invitations')
export class OrganizationInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  organizationId: string;

  // FIXED: Keep only one relationship to Organization
  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  email: string;

  @Column('simple-array')
  roles: string[];

  @Column('uuid')
  invitedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'invitedById' })
  invitedBy: User;

  @Column('uuid', { nullable: true })
  invitedUserId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'invitedUserId' })
  invitedUser: User;

  @Column()
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING
  })
  status: InvitationStatus;

  @Column('uuid', { array: true, nullable: true })
  departmentIds: string[];

  @Column({ nullable: true })
  acceptedAt: Date;

  @Column({ nullable: true })
  declinedAt: Date;

  @Column({ nullable: true })
  revokedAt: Date;

  @Column('uuid', { nullable: true })
  revokedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'revokedById' })
  revokedBy: User;

  @Column({ nullable: true })
  message: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column({ default: false })
  isResent: boolean;

  @Column({ nullable: true })
  lastResentAt: Date;

  @Column({ default: 0 })
  resendCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Check if invitation has expired
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Check if invitation can be resent
   */
  canBeResent(): boolean {
    return (
      this.status === InvitationStatus.PENDING &&
      !this.isExpired() &&
      this.resendCount < 3
    );
  }

  /**
   * Check if invitation can be accepted
   */
  canBeAccepted(): boolean {
    return (
      this.status === InvitationStatus.PENDING &&
      !this.isExpired()
    );
  }

  /**
   * Check if invitation can be revoked
   */
  canBeRevoked(): boolean {
    return this.status === InvitationStatus.PENDING;
  }
}