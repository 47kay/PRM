// src/modules/whatsapp/entities/whatsapp-template.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import {
  WhatsappTemplateStatus,
  WhatsappTemplateCategory,
  WhatsappTemplateComponentType,
  WhatsappTemplateHeaderType,
  WhatsappTemplateButtonType
} from '../enums/whatsapp-template.enums';

// Re-export the enums so they can be imported from this file
export {
  WhatsappTemplateStatus,
  WhatsappTemplateCategory,
  WhatsappTemplateComponentType,
  WhatsappTemplateHeaderType,
  WhatsappTemplateButtonType
} from '../enums/whatsapp-template.enums';
/**
 * Interface for template button
 */
export interface WhatsappTemplateButton {
  type: WhatsappTemplateButtonType;
  text: string;
  url?: string;
  phoneNumber?: string;
  payload?: string;
}

/**
 * Interface for template component
 */
export interface WhatsappTemplateComponent {
  type: WhatsappTemplateComponentType;
  text?: string;
  format?: WhatsappTemplateHeaderType;
  example?: {
    header_text?: string[];
    body_text?: string[][];
    header_handle?: string[];
  };
  buttons?: WhatsappTemplateButton[];
}

/**
 * Whatsapp template entity
 */
@Entity('whatsapp_templates')
export class WhatsappTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  organizationId: string;

  @Column()
  @Index()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ 
    type: 'enum', 
    enum: WhatsappTemplateCategory, 
    default: WhatsappTemplateCategory.UTILITY 
  })
  category: WhatsappTemplateCategory;

  @Column({ 
    type: 'enum', 
    enum: WhatsappTemplateStatus, 
    default: WhatsappTemplateStatus.DRAFT 
  })
  @Index()
  status: WhatsappTemplateStatus;

  @Column({ default: 'en' })
  language: string;

  @Column({ nullable: true })
  externalTemplateId?: string;

  @Column({ type: 'jsonb' })
  components: WhatsappTemplateComponent[];

  @Column({ default: false })
  isDefault: boolean;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ nullable: true })
  rejectionReason?: string;

  @Column({ nullable: true, type: 'jsonb' })
  metadata?: Record<string, any>;

  @Column({ default: 0 })
  useCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @Column({ nullable: true })
  createdById?: string;

  @Column({ nullable: true })
  updatedById?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  /**
   * Get template variable placeholders
   * Extracts all {{variable}} patterns from components
   */
  getVariables(): string[] {
    const variables = new Set<string>();
    const regex = /{{([^{}]+)}}/g;
    
    this.components.forEach(component => {
      if (component.text) {
        let match;
        while ((match = regex.exec(component.text)) !== null) {
          variables.add(match[1].trim());
        }
      }
      
      // Check button URLs for variables
      if (component.buttons) {
        component.buttons.forEach(button => {
          if (button.url) {
            let match;
            while ((match = regex.exec(button.url)) !== null) {
              variables.add(match[1].trim());
            }
          }
        });
      }
    });
    
    return Array.from(variables);
  }

  /**
   * Get the body text of the template
   */
  getBodyText(): string | null {
    const bodyComponent = this.components.find(c => 
      c.type === WhatsappTemplateComponentType.BODY
    );
    
    return bodyComponent?.text || null;
  }

  /**
   * Get the header text of the template
   */
  getHeaderText(): string | null {
    const headerComponent = this.components.find(c => 
      c.type === WhatsappTemplateComponentType.HEADER && 
      c.format === WhatsappTemplateHeaderType.TEXT
    );
    
    return headerComponent?.text || null;
  }

  /**
   * Process template with variables
   */
  processTemplate(variables: Record<string, any> = {}): {
    body: string;
    header?: string;
    footer?: string;
    buttons?: WhatsappTemplateButton[];
  } {
    const result: {
      body: string;
      header?: string;
      footer?: string;
      buttons?: WhatsappTemplateButton[];
    } = {
      body: ''
    };
    
    // Process each component
    for (const component of this.components) {
      switch (component.type) {
        case WhatsappTemplateComponentType.BODY:
          result.body = this.processText(component.text || '', variables);
          break;
          
        case WhatsappTemplateComponentType.HEADER:
          if (component.format === WhatsappTemplateHeaderType.TEXT) {
            result.header = this.processText(component.text || '', variables);
          }
          break;
          
        case WhatsappTemplateComponentType.FOOTER:
          result.footer = this.processText(component.text || '', variables);
          break;
          
        case WhatsappTemplateComponentType.BUTTONS:
          if (component.buttons) {
            result.buttons = component.buttons.map(button => {
              const processedButton = { ...button };
              
              if (button.url) {
                processedButton.url = this.processText(button.url, variables);
              }
              
              return processedButton;
            });
          }
          break;
      }
    }
    
    return result;
  }

  /**
   * Process text by replacing variables
   */
  private processText(text: string, variables: Record<string, any>): string {
    let processed = text;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, String(value ?? ''));
    }
    
    return processed;
  }
}