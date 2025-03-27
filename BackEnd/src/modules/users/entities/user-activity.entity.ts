import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
    UpdateDateColumn,
} from 'typeorm';
// Change to type-only import to break circular dependency
import type { User } from './user.entity';
import { Organization } from '../../organizations/entities/organization.entity';


export enum ActivityType {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    PASSWORD_CHANGE = 'PASSWORD_CHANGE',
    PROFILE_UPDATE = 'PROFILE_UPDATE',
    TICKET_CREATE = 'TICKET_CREATE',
    TICKET_UPDATE = 'TICKET_UPDATE',
    TICKET_COMMENT = 'TICKET_COMMENT',
    TICKET_ASSIGNMENT = 'TICKET_ASSIGNMENT',
    TICKET_STATUS_CHANGE = 'TICKET_STATUS_CHANGE',
    MESSAGE_SEND = 'MESSAGE_SEND',
    APPOINTMENT_CREATE = 'APPOINTMENT_CREATE',
    APPOINTMENT_UPDATE = 'APPOINTMENT_UPDATE',
    APPOINTMENT_CANCEL = 'APPOINTMENT_CANCEL',
    DOCUMENT_UPLOAD = 'DOCUMENT_UPLOAD',
    DOCUMENT_DELETE = 'DOCUMENT_DELETE',
    SETTINGS_UPDATE = 'SETTINGS_UPDATE',
    API_ACCESS = 'API_ACCESS',
    FAILED_LOGIN = 'FAILED_LOGIN',
    EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
    PHONE_VERIFICATION = 'PHONE_VERIFICATION'
}

@Entity('user_activities')
@Index(['organizationId', 'userId'])
@Index(['organizationId', 'activityType'])
@Index(['organizationId', 'createdAt'])


export class UserActivity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    organizationId: string;

    @Column()
    action: string;

    @Column()
    performedById: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    type: string;
  
    @Column({ nullable: true })
    description: string;
  
    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;
  
    @Column({ nullable: true })
    ipAddress: string;
  
    @Column({ nullable: true })
    userAgent: string;
  
    @Column({ nullable: true })
    referrer: string;
  
    @Column({ nullable: true })
    status: string;
  
    @Column({ nullable: true })
    failureReason: string;

    @Column({
        type: 'enum',
        enum: ActivityType
    })
    activityType: ActivityType;

    @Column({ type: 'jsonb', nullable: true })
    details: {
        resourceId?: string;
        resourceType?: string;
        oldValue?: any;
        newValue?: any;
        description?: string;
        additionalInfo?: Record<string, any>;
    };

    @Column({ default: true })
    isSuccess: boolean;

    @Column({ nullable: true })
    errorMessage?: string;

    @Column({ type: 'jsonb', nullable: true })
    context: {
        module?: string;
        action?: string;
        target?: string;
        result?: string;
        severity?: 'LOW' | 'MEDIUM' | 'HIGH';
    };

    // Relations
    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @ManyToOne('User')
    @JoinColumn({ name: 'userId' })
    user: User;
}