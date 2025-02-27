import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';

export enum TemplateStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAUSED = 'PAUSED',
  DELETED = 'DELETED'
}

export enum TemplateCategory {
  MARKETING = 'MARKETING',
  UTILITY = 'UTILITY',
  AUTHENTICATION = 'AUTHENTICATION',
  APPOINTMENT = 'APPOINTMENT',
  PAYMENT = 'PAYMENT',
  CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT'
}

export enum TemplateLanguage {
  EN = 'en',
  ES = 'es',
  PT = 'pt',
  FR = 'fr',
  DE = 'de',
  IT = 'it',
  AR = 'ar',
  HI = 'hi',
  ZH = 'zh'
}

@Entity('whatsapp_templates')
@Index(['organizationId', 'name'])
export class WhatsAppTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: TemplateCategory
  })
  category: TemplateCategory;

  @Column({
    type: 'enum',
    enum: TemplateLanguage,
    default: TemplateLanguage.EN
  })
  language: TemplateLanguage;

  @Column('text')
  content: string;
  

  @Column('jsonb')
  components: {
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    text?: string;
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    example?: Record<string, any>;
  }[];

  @Column('text', { array: true })
  variables: string[];

  @Column('jsonb', { nullable: true })
  sampleValues: Record<string, string[]>;

  @Column({
    type: 'enum',
    enum: TemplateStatus,
    default: TemplateStatus.DRAFT
  })
  status: TemplateStatus;

  @Column({ nullable: true })
  whatsappTemplateId: string | undefined;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column('text', { array: true, nullable: true })
  allowedTags: string[];

  @Column({ nullable: true })
  description: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column({ default: 1 })
  version: number;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: 0 })
  usageCount: number;

  @Column('uuid', { nullable: true })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column('uuid', { nullable: true })
  updatedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User;

  @Column('uuid', { nullable: true })
  approvedById: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approvedById' })
  approvedBy: User;

  @Column({ nullable: true })
  approvedAt: Date | undefined;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
    headerType: any;
    buttons: any;

  /**
   * Check if template is editable
   */
  isEditable(): boolean {
    return [
      TemplateStatus.DRAFT,
      TemplateStatus.REJECTED
    ].includes(this.status);
  }

  /**
   * Check if template can be submitted for approval
   */
  canSubmitForApproval(): boolean {
    return [
      TemplateStatus.DRAFT,
      TemplateStatus.REJECTED
    ].includes(this.status);
  }

  /**
   * Check if template is usable
   */
  isUsable(): boolean {
    return (
      this.status === TemplateStatus.APPROVED &&
      this.isActive &&
      !this.isExpired()
    );
  }

  /**
   * Check if template is expired
   */
  isExpired(): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return this.expiresAt < new Date();
  }

  /**
   * Validate template variables
   */
  validateVariables(values: Record<string, string>): boolean {
    const providedVariables = Object.keys(values);
    const requiredVariables = this.variables;

    // Check if all required variables are provided
    return requiredVariables.every(variable => 
      providedVariables.includes(variable)
    );
  }

  /**
   * Create new version
   */
  createNewVersion(): WhatsAppTemplate {
    const newTemplate = new WhatsAppTemplate();
    Object.assign(newTemplate, this);
    newTemplate.id = this.generateUniqueId();
    newTemplate.version = this.version + 1;
    newTemplate.status = TemplateStatus.DRAFT;
    newTemplate.whatsappTemplateId = undefined;
    newTemplate.approvedAt = undefined;
    newTemplate.approvedById = null;
    newTemplate.usageCount = 0;
    return newTemplate;
  }
    generateUniqueId(): string {
        throw new Error('Method not implemented.');
    }

  /**
   * Increment usage count
   */
  incrementUsage(): void {
    this.usageCount += 1;
  }
}