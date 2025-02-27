import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('notification_templates')
export class NotificationTemplate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    subject: string;

    @Column('text')
    content: string;

    @Column('json', { nullable: true })
    metadata: Record<string, any>;

    @Column('simple-array')
    channels: string[];

    @Column({ default: true })
    isActive: boolean;

    @Column('uuid')
    organizationId: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @Column('json', { nullable: true })
    variables: {
        name: string;
        type: 'string' | 'number' | 'boolean' | 'date';
        required: boolean;
        defaultValue?: any;
    }[];

    @Column('json', { nullable: true })
    channelSpecificContent: {
        email?: {
            htmlTemplate?: string;
            plainTextTemplate?: string;
        };
        sms?: {
            template: string;
        };
        push?: {
            title: string;
            body: string;
        };
        webhook?: {
            payload: Record<string, any>;
        };
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    lastUsedAt: Date;

    @Column({ default: 0 })
    useCount: number;
}