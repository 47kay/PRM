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

  @PrimaryGeneratedColumn('uuid')

    @Column()
    organizationId: string;

    @ManyToOne(() => Organization, organization => organization.invitations)
    organization: Organization;

    @Column()
    email: string;

    @Column('simple-array')
    roles: string[];

    @ManyToOne(() => User)
    invitedBy: User;

    @Column()
    token: string;

    @Column()
    expiresAt: Date;

    @Column({
        type: 'enum',
        enum: InvitationStatus,
        default: InvitationStatus.PENDING
    })
    status: InvitationStatus;

    @Column({ nullable: true })

    @Column({ nullable: true })

    // Add metadata column
    @Column('json', { nullable: true })


  @Column('uuid')


  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })

  @Column()

  @Column('uuid', { nullable: true })
  invitedUserId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'invitedUserId' })
  invitedUser: User;

  @Column('uuid')
  invitedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'invitedById' })


  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING
  })

  @Column('simple-array')

  @Column('uuid', { array: true, nullable: true })
  departmentIds: string[];

  @Column({ type: 'timestamp' })

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

  @Column({ unique: true })

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