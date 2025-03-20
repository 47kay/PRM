// src/modules/email/services/email-template.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, In, Not } from 'typeorm';
import { EmailTemplate, EmailTemplateStatus, EmailTemplateType } from '../entities/email-template.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class EmailTemplateService {
  private readonly defaultTemplatePath: string;

  constructor(
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
  ) {
    // Set the default path for template files
    this.defaultTemplatePath = path.join(process.cwd(), 'src/templates/email');
    
    // Register Handlebars helpers
    this.registerHandlebarsHelpers();
  }

  /**
   * Find a template by ID
   */
  async findById(id: string, organizationId: string): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { id, organizationId }
    });

    if (!template) {
      throw new NotFoundException(`Email template with ID "${id}" not found`);
    }

    return template;
  }

  /**
   * Find a template by name
   */
  async findByName(name: string, organizationId: string): Promise<EmailTemplate | null> {
    return this.emailTemplateRepository.findOne({
      where: { name, organizationId, status: EmailTemplateStatus.ACTIVE }
    });
  }

  /**
   * Get all templates for an organization
   */
  async findAll(options: {
    organizationId: string;
    status?: EmailTemplateStatus | EmailTemplateStatus[];
    type?: EmailTemplateType;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: EmailTemplate[]; total: number; page: number; limit: number }> {
    const { 
      organizationId, 
      status, 
      type, 
      category, 
      search,
      page = 1, 
      limit = 25 
    } = options;

    const where: FindOptionsWhere<EmailTemplate> = { organizationId };
    
    if (status) {
      where.status = Array.isArray(status) ? In(status) : status;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [items, total] = await this.emailTemplateRepository.findAndCount({
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
   * Create a new email template
   */
  async create(data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    // Check if template with same name already exists
    const existingTemplate = await this.emailTemplateRepository.findOne({
      where: { 
        name: data.name, 
        organizationId: data.organizationId 
      }
    });

    if (existingTemplate) {
      throw new BadRequestException(`Template with name "${data.name}" already exists`);
    }

    const template = this.emailTemplateRepository.create(data);
    return this.emailTemplateRepository.save(template);
  }

  /**
   * Update an existing email template
   */
  async update(id: string, organizationId: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const template = await this.findById(id, organizationId);
    
    // If updating name, check if it already exists
    if (data.name && data.name !== template.name) {
      const existingTemplate = await this.emailTemplateRepository.findOne({
        where: { 
          name: data.name, 
          organizationId, 
          id: Not(id) 
        }
      });

      if (existingTemplate) {
        throw new BadRequestException(`Template with name "${data.name}" already exists`);
      }
    }

    Object.assign(template, data);
    return this.emailTemplateRepository.save(template);
  }

  /**
   * Delete an email template
   */
  async delete(id: string, organizationId: string): Promise<void> {
    const template = await this.findById(id, organizationId);
    await this.emailTemplateRepository.softRemove(template);
  }

  /**
   * Load and compile template from file
   */
  async loadTemplateFromFile(filename: string): Promise<string> {
    const templatePath = path.join(this.defaultTemplatePath, filename);
    
    try {
      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      throw new NotFoundException(`Template file "${filename}" not found`);
    }
  }

  /**
   * Render template with variables
   */
  renderTemplate(content: string, variables: Record<string, any> = {}): string {
    try {
      const template = Handlebars.compile(content);
      return template(variables);
    } catch (error) {
      throw new BadRequestException(`Error rendering template: ${error.message}`);
    }
  }

  /**
   * Render a template by ID with variables
   */
  async renderTemplateById(
    id: string, 
    organizationId: string, 
    variables: Record<string, any> = {}
  ): Promise<{ subject: string; content: string; plainTextContent?: string }> {
    const template = await this.findById(id, organizationId);
    
    const content = this.renderTemplate(template.content, variables);
    const subject = this.renderTemplate(template.subject, variables);
    
    const plainTextContent = template.plainTextContent 
      ? this.renderTemplate(template.plainTextContent, variables)
      : undefined;

    return { subject, content, plainTextContent };
  }

  /**
   * Get template categories for an organization
   */
  async getCategories(organizationId: string): Promise<string[]> {
    const result = await this.emailTemplateRepository
      .createQueryBuilder('template')
      .select('DISTINCT template.category')
      .where('template.organizationId = :organizationId', { organizationId })
      .andWhere('template.category IS NOT NULL')
      .getRawMany();

    return result.map(item => item.category).filter(Boolean);
  }

  /**
   * Clone a template
   */
  async cloneTemplate(id: string, organizationId: string, newName?: string): Promise<EmailTemplate> {
    const template = await this.findById(id, organizationId);
    
    // Using destructuring to exclude the id from the template data
    const { id: templateId, ...templateData } = template;
    
    // Create a new name if not provided
    const name = newName || `${template.name} (Copy)`;
    
    return this.create({
      ...templateData,
      name,
      status: EmailTemplateStatus.DRAFT, // Set as draft by default
      isDefault: false, // Never clone as default
      organizationId,
    });
  }

  /**
   * Register custom Handlebars helpers
   */
  private registerHandlebarsHelpers(): void {
    // Format date helper
    Handlebars.registerHelper('formatDate', function(date: Date, format: string) {
      if (!date) return '';
      
      const d = new Date(date);
      
      switch (format) {
        case 'short':
          return d.toLocaleDateString();
        case 'long':
          return d.toLocaleDateString(undefined, { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        case 'time':
          return d.toLocaleTimeString();
        case 'datetime':
          return d.toLocaleString();
        default:
          return d.toDateString();
      }
    });

    // Conditional helper
    Handlebars.registerHelper('ifCond', function(v1: any, operator: string, v2: any, options: any) {
      switch (operator) {
        case '==':
          return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
          return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
          return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
          return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
          return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
          return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
          return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
          return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    });
  }
}