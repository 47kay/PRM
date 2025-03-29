import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
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

    @ApiProperty({ 
      type: 'array',
      items: { type: 'string' },
      description: 'Supported notification channels'
    })
    @Column('simple-array')
    channels: string[];

    @Column({ default: true })
    isActive: boolean;

    @Column('uuid')
    organizationId: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @ApiProperty({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['string', 'number', 'boolean', 'date'] },
          required: { type: 'boolean' },
          defaultValue: { type: 'string', nullable: true }
        }
      },
      nullable: true
    })
    @Column('json', { nullable: true })
    variables: {
        name: string;
        type: 'string' | 'number' | 'boolean' | 'date';
        required: boolean;
        defaultValue?: any;
    }[];

    @ApiProperty({
      type: 'object',
      properties: {
        email: {
          type: 'object',
          properties: {
            htmlTemplate: { type: 'string' },
            plainTextTemplate: { type: 'string' }
          }
        },
        sms: {
          type: 'object',
          properties: {
            template: { type: 'string' }
          }
        },
        push: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            body: { type: 'string' }
          }
        },
        webhook: {
          type: 'object',
          properties: {
            payload: { type: 'object' }
          }
        }
      },
      nullable: true
    })
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