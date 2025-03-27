import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageTemplate } from '../entities/message-template.entity';

@Injectable()
export class TemplateService {
    constructor(
        @InjectRepository(MessageTemplate)
        private readonly templateRepository: Repository<MessageTemplate>,
    ) {}
    
    async findById(id: string, organizationId: string): Promise<MessageTemplate> {
        const template = await this.templateRepository.findOne({
            where: { id, organizationId }
        });
        
        if (!template) {
            throw new NotFoundException(`Template with ID ${id} not found`);
        }
        
        return template;
    }
    
    processTemplate(template: string, data: any): string {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            const value = data[key];
            return value !== undefined && value !== null ? String(value) : match;
        });
    }
}