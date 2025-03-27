// src/modules/whatsapp/services/whatsapp-template.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, In, Not } from 'typeorm';
import { WhatsappTemplate } from '../entities/whatsapp-template.entity';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import {
  WhatsappTemplateStatus,
  WhatsappTemplateCategory,
  WhatsappTemplateComponentType,
  WhatsappTemplateHeaderType,
  WhatsappTemplateButtonType
} from '../enums/whatsapp-template.enums';

// Re-export enums for backward compatibility
export {
  WhatsappTemplateStatus,
  WhatsappTemplateCategory,
  WhatsappTemplateComponentType,
  WhatsappTemplateHeaderType,
  WhatsappTemplateButtonType
} from '../enums/whatsapp-template.enums';

@Injectable()
export class WhatsappTemplateService {
  private readonly logger = new Logger(WhatsappTemplateService.name);

  constructor(
    @InjectRepository(WhatsappTemplate)
    private whatsappTemplateRepository: Repository<WhatsappTemplate>,
    private configService: ConfigService
  ) {}

  /**
   * Find a template by ID
   */
  async findById(id: string, organizationId: string): Promise<WhatsappTemplate> {
    const template = await this.whatsappTemplateRepository.findOne({
      where: { id, organizationId }
    });

    if (!template) {
      throw new NotFoundException(`WhatsApp template with ID "${id}" not found`);
    }

    return template;
  }

  /**
   * Find a template by name
   */
  async findByName(name: string, organizationId: string): Promise<WhatsappTemplate | null> {
    return this.whatsappTemplateRepository.findOne({
      where: { name, organizationId, status: WhatsappTemplateStatus.ACTIVE }
    });
  }

  /**
   * Get all templates for an organization
   */
  async findAll(options: {
    organizationId: string;
    status?: WhatsappTemplateStatus | WhatsappTemplateStatus[];
    category?: WhatsappTemplateCategory | WhatsappTemplateCategory[];
    language?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: WhatsappTemplate[]; total: number; page: number; limit: number }> {
    const { 
      organizationId, 
      status, 
      category, 
      language,
      search,
      page = 1, 
      limit = 25 
    } = options;

    const where: FindOptionsWhere<WhatsappTemplate> = { organizationId };
    
    if (status) {
      where.status = Array.isArray(status) ? In(status) : status;
    }
    
    if (category) {
      where.category = Array.isArray(category) ? In(category) : category;
    }
    
    if (language) {
      where.language = language;
    }
    
    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [items, total] = await this.whatsappTemplateRepository.findAndCount({
      where,
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Create a new WhatsApp template
   */
  async create(data: Partial<WhatsappTemplate>): Promise<WhatsappTemplate> {
    // Validate template structure
    this.validateTemplate(data);

    // Check if template with same name already exists
    const existingTemplate = await this.whatsappTemplateRepository.findOne({
      where: { 
        name: data.name, 
        organizationId: data.organizationId,
        language: data.language
      }
    });

    if (existingTemplate) {
      throw new BadRequestException(`Template with name "${data.name}" and language "${data.language}" already exists`);
    }

    const template = this.whatsappTemplateRepository.create({
      ...data,
      status: data.status || WhatsappTemplateStatus.DRAFT
    });
    
    return this.whatsappTemplateRepository.save(template);
  }

  /**
   * Update an existing WhatsApp template
   */
  async update(id: string, organizationId: string, data: Partial<WhatsappTemplate>): Promise<WhatsappTemplate> {
    const template = await this.findById(id, organizationId);
    
    // Check if template is in a state that allows updates
    if (template.status === WhatsappTemplateStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Cannot update a template that is pending approval');
    }
    
    if (template.status === WhatsappTemplateStatus.APPROVED && data.components) {
      throw new BadRequestException('Cannot update components of an approved template. Create a new version instead.');
    }

    // If updating name, check if it already exists
    if (data.name && data.name !== template.name) {
      const existingTemplate = await this.whatsappTemplateRepository.findOne({
        where: { 
          name: data.name, 
          organizationId,
          language: data.language || template.language,
          id: Not(id) 
        }
      });

      if (existingTemplate) {
        throw new BadRequestException(`Template with name "${data.name}" and language "${data.language || template.language}" already exists`);
      }
    }

    // Validate template if components are being updated
    if (data.components) {
      this.validateTemplate({
        ...template,
        ...data
      });
    }

    // Update template
    Object.assign(template, data);
    
    // Set status to draft if content was changed and template was rejected
    if (
      data.components && 
      (template.status === WhatsappTemplateStatus.REJECTED)
    ) {
      template.status = WhatsappTemplateStatus.DRAFT;
      template.rejectionReason = undefined;
    }

    return this.whatsappTemplateRepository.save(template);
  }

  /**
   * Submit template for approval
   */
  async submitForApproval(id: string, organizationId: string): Promise<WhatsappTemplate> {
    const template = await this.findById(id, organizationId);
    
    if (template.status !== WhatsappTemplateStatus.DRAFT) {
      throw new BadRequestException(`Only templates in DRAFT status can be submitted for approval`);
    }
    
    // Validate template before submitting
    this.validateTemplate(template);
    
    // Update status
    template.status = WhatsappTemplateStatus.PENDING_APPROVAL;
    template.submittedAt = new Date();
    
    // Save and return updated template
    const updatedTemplate = await this.whatsappTemplateRepository.save(template);
    
    // Here you would typically call the WhatsApp API to submit the template
    this.submitTemplateToWhatsAppAPI(updatedTemplate).catch(error => {
      this.logger.error(`Failed to submit template to WhatsApp API: ${error.message}`, error.stack);
    });
    
    return updatedTemplate;
  }

  /**
   * Delete/archive a WhatsApp template
   */
  async delete(id: string, organizationId: string): Promise<void> {
    const template = await this.findById(id, organizationId);
    
    if (template.status === WhatsappTemplateStatus.ACTIVE) {
      template.status = WhatsappTemplateStatus.INACTIVE;
      await this.whatsappTemplateRepository.save(template);
    } else {
      await this.whatsappTemplateRepository.softRemove(template);
    }
    
    // If the template is approved/active on the WhatsApp API, you would call the API to delete it
    if ([WhatsappTemplateStatus.APPROVED, WhatsappTemplateStatus.ACTIVE].includes(template.status)) {
      this.deleteTemplateFromWhatsAppAPI(template).catch(error => {
        this.logger.error(`Failed to delete template from WhatsApp API: ${error.message}`, error.stack);
      });
    }
  }

  /**
   * Get available languages for templates
   */
  async getAvailableLanguages(): Promise<{ code: string; name: string }[]> {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'pt_BR', name: 'Portuguese (Brazil)' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'id', name: 'Indonesian' },
      { code: 'ru', name: 'Russian' },
      { code: 'zh_CN', name: 'Chinese (Simplified)' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
    ];
  }

  /**
   * Process variable placeholders in template text
   */
  processTemplateText(text: string, variables: Record<string, any> = {}): string {
    if (!text) return '';
    
    // Replace {{variable}} placeholders
    let processed = text;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, String(value ?? ''));
    }
    
    return processed;
  }

  /**
   * Validate template structure
   */
  private validateTemplate(template: Partial<WhatsappTemplate>): void {
    if (!template.components || !Array.isArray(template.components) || template.components.length === 0) {
      throw new BadRequestException('Template must have at least one component');
    }
    
    // Check for required body component
    const bodyComponent = template.components.find(c => 
      c.type === WhatsappTemplateComponentType.BODY
    );
    
    if (!bodyComponent) {
      throw new BadRequestException('Template must have a body component');
    }
    
    if (!bodyComponent.text) {
      throw new BadRequestException('Body component must have text');
    }
    
    // Check header component if present
    const headerComponent = template.components.find(c => 
      c.type === WhatsappTemplateComponentType.HEADER
    );
    
    if (headerComponent) {
      if (!headerComponent.format) {
        throw new BadRequestException('Header component must specify a format');
      }
      
      if (headerComponent.format === WhatsappTemplateHeaderType.TEXT && !headerComponent.text) {
        throw new BadRequestException('Text header must have text content');
      }
    }
    
    // Check buttons if present
    const buttonsComponent = template.components.find(c => 
      c.type === WhatsappTemplateComponentType.BUTTONS
    );
    
    if (buttonsComponent && buttonsComponent.buttons) {
      if (buttonsComponent.buttons.length > 3) {
        throw new BadRequestException('Template can have a maximum of 3 buttons');
      }
      
      // Validate each button
      for (const button of buttonsComponent.buttons) {
        if (!button.type) {
          throw new BadRequestException('Each button must have a type');
        }
        
        if (!button.text) {
          throw new BadRequestException('Each button must have text');
        }
        
        if (button.type === WhatsappTemplateButtonType.URL && !button.url) {
          throw new BadRequestException('URL button must have a URL');
        }
        
        if (button.type === WhatsappTemplateButtonType.PHONE_NUMBER && !button.phoneNumber) {
          throw new BadRequestException('Phone number button must have a phone number');
        }
      }
    }
  }

  /**
   * Submit template to WhatsApp API (Meta/Facebook)
   * This is a placeholder for the actual API call
   */
  private async submitTemplateToWhatsAppAPI(template: WhatsappTemplate): Promise<any> {
    // This would be implemented based on the specific WhatsApp Business API you're using
    const apiKey = this.configService.get<string>('WHATSAPP_API_KEY');
    const accountId = this.configService.get<string>('WHATSAPP_ACCOUNT_ID');
    
    // This is just a placeholder - you would replace with actual API call
    this.logger.log(`[Mock] Submitting template ${template.name} to WhatsApp API`);
    
    // Mock API response
    return {
      id: `${Date.now()}`,
      status: 'PENDING',
      category: template.category
    };
  }

  /**
   * Delete template from WhatsApp API (Meta/Facebook)
   * This is a placeholder for the actual API call
   */
  private async deleteTemplateFromWhatsAppAPI(template: WhatsappTemplate): Promise<any> {
    // This would be implemented based on the specific WhatsApp Business API you're using
    this.logger.log(`[Mock] Deleting template ${template.name} from WhatsApp API`);
    
    // Mock API response
    return {
      success: true
    };
  }

  /**
   * Sync templates from WhatsApp API
   * This would be used to sync the status of pending templates
   */
  async syncTemplatesFromWhatsAppAPI(organizationId: string): Promise<void> {
    // Get pending templates
    const pendingTemplates = await this.whatsappTemplateRepository.find({
      where: {
        organizationId,
        status: WhatsappTemplateStatus.PENDING_APPROVAL
      }
    });
    
    for (const template of pendingTemplates) {
      // This would make an API call to check the status
      // For now, we'll just simulate a response
      const mockApiResponse = {
        status: Math.random() > 0.3 ? 'APPROVED' : 'REJECTED',
        reason: 'This is a simulated response'
      };
      
      if (mockApiResponse.status === 'APPROVED') {
        template.status = WhatsappTemplateStatus.APPROVED;
        template.approvedAt = new Date();
      } else {
        template.status = WhatsappTemplateStatus.REJECTED;
        template.rejectionReason = mockApiResponse.reason;
      }
      
      await this.whatsappTemplateRepository.save(template);
    }
  }
}