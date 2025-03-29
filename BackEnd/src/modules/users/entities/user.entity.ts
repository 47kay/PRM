// src/modules/users/entities/user.entity.ts

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enums/role.enum';
import { Organization } from '../../organizations/entities/organization.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Message } from '../../messages/entities/message.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { UserActivity } from './user-activity.entity';

@Entity('users')
@Index(['organizationId', 'email'])
@Index(['organizationId', 'phoneNumber'])
@Index(['organizationId', 'role'])
export class User {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;
    mobilePhone?: string; // added mobilePhone property

    @ApiProperty()
    @Column()
    organizationId: string;

    @ApiProperty()
    @Column()
    firstName: string;

    @ApiProperty()
    @Column()
    lastName: string;

    @ApiProperty()
    @Column({ unique: true })
    @Index()
    email: string;

    @Column()
    password: string;

    @ApiProperty()
    @Column({ nullable: true })
    phoneNumber?: string;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: Role,
        default: Role.STAFF
    })
    role: Role;

    @ApiProperty()
    @Column({ nullable: true })
    title?: string;

    @ApiProperty()
    @Column({ nullable: true })
    department?: string;

    @ApiProperty()
    @Column({ nullable: true })
    employeeId?: string;

    @ApiProperty()
    @Column({ type: 'jsonb', nullable: true })
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };

    @ApiProperty()
    @Column({ type: 'jsonb', nullable: true })
    emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
        address?: string;
    };

    @ApiProperty()
    @Column({ nullable: true })
    licenseNumber?: string;

    @ApiProperty()
    @Column({ nullable: true })
    specialization?: string;

    @ApiProperty()
    @Column('simple-array', { nullable: true })
    qualifications?: string[];

    @ApiProperty()
    @Column('simple-array', { nullable: true })
    certifications?: string[];

    @ApiProperty()
    @Column({ default: false })
    isOnCall: boolean;

    @ApiProperty()
    @Column('simple-array', { nullable: true })
    languages?: string[];

    @ApiProperty()
    @Column({ default: true })
    requirePasswordChange: boolean;

    @ApiProperty()
    @Column({ type: 'jsonb', nullable: true })
    preferences?: {
        theme?: string;
        notifications?: {
            email?: boolean;
            sms?: boolean;
            inApp?: boolean;
        };
        timezone?: string;
        language?: string;
    };

    @ApiProperty()
    @Column({ type: 'jsonb', nullable: true })
    metadata?: Record<string, any>;

    @ApiProperty()
    @Column({ default: true })
    isActive: boolean;

    @ApiProperty()
    @Column({ default: false })
    isLocked: boolean;

    @ApiProperty()
    @Column({ default: false })
    isEmailVerified: boolean;

    @ApiProperty()
    @Column({ default: false })
    isPhoneVerified: boolean;

    @ApiProperty()
    @Column({ nullable: true })
    lastLoginAt?: Date;

    @ApiProperty()
    @Column({ nullable: true })
    lastActiveAt?: Date;

    @ApiProperty()
    @Column('simple-array', { nullable: true })
    deviceTokens?: string[];

    @ApiProperty()
    @Column({ nullable: true })
    avatar?: string;

    @ApiProperty()
    @Column({ nullable: true })
    signature?: string;

    @ApiProperty()
    @Column()
    createdById: string;

    @ApiProperty()
    @Column({ nullable: true })
    updatedById?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    // Relations
    @ManyToOne('Organization')
    @JoinColumn({ name: 'organizationId' })
    organization: any;

    // Change this to use lazy loading
    @ManyToOne(() => User, { lazy: true })
    @JoinColumn({ name: 'createdById' })
    createdBy: Promise<User>;

    // Change this to use lazy loading
    @ManyToOne(() => User, { lazy: true })
    @JoinColumn({ name: 'updatedById' })
    updatedBy?: Promise<User>;

    // Other relationships remain the same but add lazy loading
    @OneToMany(() => Ticket, ticket => ticket.assignee, { lazy: true })
    assignedTickets: Promise<Ticket[]>;

    @OneToMany(() => Message, message => message.sender, { lazy: true })
    messages: Promise<Message[]>;

    @OneToMany(() => Appointment, appointment => appointment.provider, { lazy: true })
    appointments: Promise<Appointment[]>;

    @OneToMany(() => Notification, notification => notification.user, { lazy: true })
    notifications: Promise<Notification[]>;

    @OneToMany(() => UserActivity, activity => activity.user, { lazy: true })
    activities: Promise<UserActivity[]>;

    // Virtual properties
    @ApiProperty()
    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    @ApiProperty()
    get isAvailable(): boolean {
        return this.isActive && !this.isLocked;
    }
}