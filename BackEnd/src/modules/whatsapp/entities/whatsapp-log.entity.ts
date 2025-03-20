// src/modules/whatsapp/entities/whatsapp-log.entity.ts

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { WhatsappTemplate } from './whatsapp-template.entity';
  
  /**
   * WhatsApp message status enum
   */
  export enum WhatsappMessageStatus {
    QUEUED = 'queued',
    SENDING = 'sending',
    SENT = 'sent',
    DELIVERED = 'delivered',
    READ = 'read',
    FAILED = 'failed',
    REJECTED = 'rejected',
    CANCELED = 'canceled',
    EXPIRED = 'expired'
  }
  
  /**
   * WhatsApp message type enum
   */
  export enum WhatsappMessageType {
    TEXT = 'text',
    TEMPLATE = 'template',
    IMAGE = 'image',
    DOCUMENT = 'document',
    AUDIO = 'audio',
    VIDEO = 'video',
    STICKER = 'sticker',
    LOCATION = 'location',
    CONTACT = 'contact',
    INTERACTIVE = 'interactive',
    REACTION = 'reaction',
    BUTTON = 'button'
  }
  
  /**
   * WhatsApp media type enum
   */
  export enum WhatsappMediaType {
    IMAGE = 'image',
    DOCUMENT = 'document',
    AUDIO = 'audio',
    VIDEO = 'video',
    STICKER = 'sticker'
  }
  
  /**
   * WhatsApp log entity
   */
  @Entity('whatsapp_logs')
  export class WhatsappLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    @Index()
    organizationId: string;
  
    @Column({ type: 'enum', enum: WhatsappMessageType })
    @Index()
    messageType: WhatsappMessageType;
  
    @Column({ nullable: true })
    @Index()
    templateId?: string;
  
    @ManyToOne(() => WhatsappTemplate, { nullable: true })
    @JoinColumn({ name: 'templateId' })
    template?: WhatsappTemplate;
  
    @Column()
    @Index()
    to: string;
  
    @Column({ nullable: true })
    toName?: string;
  
    @Column()
    from: string;
  
    @Column({ nullable: true, type: 'text' })
    content?: string;
  
    @Column({ type: 'enum', enum: WhatsappMessageStatus, default: WhatsappMessageStatus.QUEUED })
    @Index()
    status: WhatsappMessageStatus;
  
    @Column({ nullable: true })
    @Index()
    messageId?: string;
  
    @Column({ nullable: true })
    @Index()
    conversationId?: string;
  
    @Column({ nullable: true, type: 'jsonb' })
    metadata?: Record<string, any>;
  
    @Column({ nullable: true, type: 'jsonb' })
    variables?: Record<string, any>;
  
    @Column({ nullable: true, type: 'jsonb' })
    components?: {
      type: string;
      parameters: any[];
    }[];
  
    @Column({ nullable: true, type: 'jsonb' })
    mediaData?: {
      type: WhatsappMediaType;
      id?: string;
      url?: string;
      caption?: string;
      filename?: string;
      mimeType?: string;
      size?: number;
    };
  
    @Column({ nullable: true, type: 'jsonb' })
    deliveryDetails?: {
      provider?: string;
      attemptCount?: number;
      lastAttemptAt?: Date;
      deliveredAt?: Date;
      readAt?: Date;
      error?: string;
      errorCode?: string;
      errorDetails?: any;
      receivedAt?: Date;
      cost?: number;
      currency?: string;
      wamid?: string; // WhatsApp Message ID
      phoneType?: string;
      phoneModel?: string;
      pricing?: {
        pricing_model: string;
        category: string;
        cost: number;
        currency: string;
      };
    };
  
    @Column({ nullable: true })
    @Index()
    recipientId?: string;
  
    @Column({ nullable: true })
    @Index()
    senderId?: string;
  
    @Column({ nullable: true })
    @Index()
    referenceId?: string;
  
    @Column({ nullable: true })
    referenceType?: string;
  
    @Column({ type: 'timestamp', nullable: true })
    scheduledFor?: Date;
  
    @Column({ nullable: true })
    createdById?: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @Column({ nullable: true, type: 'boolean', default: false })
    isAutomated: boolean;
  
    @Column({ nullable: true, type: 'jsonb' })
    buttons?: {
      type: string;
      text: string;
      payload?: string;
    }[];
  
    @Column({ nullable: true, type: 'jsonb' })
    contextInfo?: {
      messageId?: string;
      forwarded?: boolean;
      frequentlyForwarded?: boolean;
      fromGroup?: boolean;
      groupId?: string;
      groupName?: string;
      quotedMessageId?: string;
      quotedMessageText?: string;
      quotedMessageSender?: string;
      mentionedContacts?: string[];
    };
  
    @Column({ nullable: true })
    @Index()
    externalBusinessId?: string;
  
    /**
     * Checks if the message is in a final status
     */
    isInFinalStatus(): boolean {
      return [
        WhatsappMessageStatus.SENT,
        WhatsappMessageStatus.DELIVERED,
        WhatsappMessageStatus.READ,
        WhatsappMessageStatus.FAILED,
        WhatsappMessageStatus.REJECTED,
        WhatsappMessageStatus.CANCELED,
        WhatsappMessageStatus.EXPIRED
      ].includes(this.status);
    }
  
    /**
     * Checks if the message was successfully delivered
     */
    isSuccessful(): boolean {
      return [
        WhatsappMessageStatus.SENT,
        WhatsappMessageStatus.DELIVERED,
        WhatsappMessageStatus.READ
      ].includes(this.status);
    }
  
    /**
     * Updates the status of the WhatsApp message
     */
    updateStatus(status: WhatsappMessageStatus, details?: Partial<WhatsappLog['deliveryDetails']>): void {
      // Don't update if already in a final status and trying to move to an earlier status
      if (this.isInFinalStatus() && 
          status !== WhatsappMessageStatus.READ && 
          status !== WhatsappMessageStatus.DELIVERED) {
        return;
      }
  
      this.status = status;
  
      // Initialize delivery details if not present
      if (!this.deliveryDetails) {
        this.deliveryDetails = {};
      }
  
      // Update delivery details based on status and provided details
      if (details) {
        this.deliveryDetails = {
          ...this.deliveryDetails,
          ...details
        };
      }
  
      // Set timestamp based on status
      if (status === WhatsappMessageStatus.SENDING) {
        this.deliveryDetails.lastAttemptAt = new Date();
        this.deliveryDetails.attemptCount = (this.deliveryDetails.attemptCount || 0) + 1;
      } else if (status === WhatsappMessageStatus.DELIVERED) {
        this.deliveryDetails.deliveredAt = new Date();
      } else if (status === WhatsappMessageStatus.READ) {
        this.deliveryDetails.readAt = new Date();
      }
    }
  
    /**
     * Get formatted content for display or logs
     */
    getFormattedContent(): string {
      if (this.messageType === WhatsappMessageType.TEXT) {
        return this.content || '';
      } else if (this.messageType === WhatsappMessageType.TEMPLATE) {
        const templateName = this.template?.name || 'Unknown Template';
        return `Template: ${templateName}`;
      } else if (this.mediaData) {
        const caption = this.mediaData.caption ? ` - ${this.mediaData.caption}` : '';
        return `${this.mediaData.type}${caption}`;
      }
      
      return `${this.messageType} message`;
    }
  
    /**
     * Get the cost of the message if available
     */
    getCost(): { amount: number; currency: string } | null {
      if (this.deliveryDetails?.cost && this.deliveryDetails?.currency) {
        return {
          amount: this.deliveryDetails.cost,
          currency: this.deliveryDetails.currency
        };
      } else if (this.deliveryDetails?.pricing) {
        return {
          amount: this.deliveryDetails.pricing.cost,
          currency: this.deliveryDetails.pricing.currency
        };
      }
      
      return null;
    }
  }