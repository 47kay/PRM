import { Repository } from 'typeorm';
import { EmailTemplate, EmailTemplateStatus, EmailTemplateType } from '../entities/email-template.entity';
export declare class EmailTemplateService {
    private emailTemplateRepository;
    private readonly defaultTemplatePath;
    constructor(emailTemplateRepository: Repository<EmailTemplate>);
    findById(id: string, organizationId: string): Promise<EmailTemplate>;
    findByName(name: string, organizationId: string): Promise<EmailTemplate | null>;
    findAll(options: {
        organizationId: string;
        status?: EmailTemplateStatus | EmailTemplateStatus[];
        type?: EmailTemplateType;
        category?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        items: EmailTemplate[];
        total: number;
        page: number;
        limit: number;
    }>;
    create(data: Partial<EmailTemplate>): Promise<EmailTemplate>;
    update(id: string, organizationId: string, data: Partial<EmailTemplate>): Promise<EmailTemplate>;
    delete(id: string, organizationId: string): Promise<void>;
    loadTemplateFromFile(filename: string): Promise<string>;
    renderTemplate(content: string, variables?: Record<string, any>): string;
    renderTemplateById(id: string, organizationId: string, variables?: Record<string, any>): Promise<{
        subject: string;
        content: string;
        plainTextContent?: string;
    }>;
    getCategories(organizationId: string): Promise<string[]>;
    cloneTemplate(id: string, organizationId: string, newName?: string): Promise<EmailTemplate>;
    private registerHandlebarsHelpers;
}
