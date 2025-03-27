// src/modules/messages/entities/message-attachment.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
// Change to type-only import to break circular dependency
import type { Message } from './message.entity';

export enum AttachmentType {
    IMAGE = 'image',
    DOCUMENT = 'document',
    AUDIO = 'audio',
    VIDEO = 'video',
    OTHER = 'other'
}

@Entity('message_attachments')
export class MessageAttachment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fileName: string;

    @Column()
    fileSize: number;

    @Column()
    mimeType: string;

    @Column({
        type: 'enum',
        enum: AttachmentType,
        default: AttachmentType.OTHER
    })
    type: AttachmentType;

    @Column()
    filePath: string;

    @Column({ nullable: true })
    publicUrl: string;

    @Column({ default: false })
    isUploaded: boolean;

    @ManyToOne('Message', {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'message_id' })
    message: Message;

    @Column({ name: 'message_id' })
    messageId: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}