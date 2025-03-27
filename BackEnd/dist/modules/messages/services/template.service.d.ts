import { Repository } from 'typeorm';
import { MessageTemplate } from '../entities/message-template.entity';
export declare class TemplateService {
    private readonly templateRepository;
    constructor(templateRepository: Repository<MessageTemplate>);
    findById(id: string, organizationId: string): Promise<MessageTemplate>;
    processTemplate(template: string, data: any): string;
}
