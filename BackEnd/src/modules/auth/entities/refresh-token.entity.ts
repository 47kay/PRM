// src/modules/auth/entities/refresh-token.entity.ts

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
@Index(['token'])
@Index(['userId', 'deviceId'])
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'uuid', nullable: true })
    organizationId: string;

    @Column({ type: 'text', unique: true })
    token: string;

    @Column({ type: 'timestamp with time zone' })
    expiresAt: Date;

    @Column({ default: false })
    isRevoked: boolean;

    @Column({ nullable: true })
    deviceId: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: {
        platform?: string;
        browser?: string;
        location?: string;
        lastUsed?: Date;
    };

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    revokedAt: Date;

    @Column({ nullable: true })
    revokedBy: string;

    @Column({ nullable: true })
    revokedReason: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    // Helper methods
    isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    isValid(): boolean {
        return !this.isRevoked && !this.isExpired();
    }

    revoke(userId: string, reason: string) {
        this.isRevoked = true;
        this.revokedAt = new Date();
        this.revokedBy = userId;
        this.revokedReason = reason;
    }

    updateLastUsed() {
        if (this.metadata) {
            this.metadata.lastUsed = new Date();
        }
    }
}