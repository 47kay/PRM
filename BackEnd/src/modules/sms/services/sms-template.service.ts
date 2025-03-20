// src/modules/sms/services/sms-template.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmsTemplate, SmsTemplateType } from '../entities/sms-template.entity';

@Injectable()
export class SmsTemplateService {
  private readonly logger = new Logger(SmsTemplateService.name);

  constructor(
    @InjectRepository(SmsTemplate)
    private readonly smsTemplateRepository: Repository<SmsTemplate>,
  ) {}

  /**
   * Find all SMS templates
   */
  async findAll(organizationId?: string): Promise<SmsTemplate[]> {
    const query = this.smsTemplateRepository.createQueryBuilder('template');
    
    if (organizationId) {
      query.where('template.organizationId = :organizationId', { organizationId });
    }
    
    return query.orderBy('template.name', 'ASC').getMany();
  }

  /**
   * Find a template by ID
   */
  async findOne(id: string, organizationId?: string): Promise<SmsTemplate> {
    const query = this.smsTemplateRepository.createQueryBuilder('template')
      .where('template.id = :id', { id });
    
    if (organizationId) {
      query.andWhere('template.organizationId = :organizationId', { organizationId });
    }
    
    const template = await query.getOne();
    
    if (!template) {
      throw new NotFoundException(`SMS template with ID ${id} not found`);
    }
    
    return template;
  }

  /**
   * Find a template by type and organization
   */
  async findByType(type: SmsTemplateType, organizationId: string): Promise<SmsTemplate> {
    const template = await this.smsTemplateRepository.findOne({
      where: {
        type,
        organizationId,
      },
    });
    
    if (!template) {
      this.logger.warn(`No template found for type ${type} in organization ${organizationId}`);
      
      // Try to find a default template
      const defaultTemplate = await this.smsTemplateRepository.findOne({
        where: {
          type,
          isDefault: true,
        },
      });
      
      if (!defaultTemplate) {
        throw new NotFoundException(`No template found for type ${type}`);
      }
      
      return defaultTemplate;
    }
    
    return template;
  }

  /**
   * Create a new SMS template
   */
  async create(data: Partial<SmsTemplate>): Promise<SmsTemplate> {
    const template = this.smsTemplateRepository.create(data);
    return this.smsTemplateRepository.save(template);
  }

  /**
   * Update an existing SMS template
   */
  async update(id: string, data: Partial<SmsTemplate>, organizationId?: string): Promise<SmsTemplate> {
    const template = await this.findOne(id, organizationId);
    
    Object.assign(template, data);
    
    return this.smsTemplateRepository.save(template);
  }

  /**
   * Delete an SMS template
   */
  async remove(id: string, organizationId?: string): Promise<void> {
    const template = await this.findOne(id, organizationId);
    
    await this.smsTemplateRepository.remove(template);
  }

  /**
   * Render a template with variables
   */
  renderTemplate(template: SmsTemplate, variables: Record<string, any>): string {
    let content = template.content;
    
    // Replace variables in the format {{variableName}}
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      content = content.replace(regex, String(value));
    }
    
    return content;
  }
}