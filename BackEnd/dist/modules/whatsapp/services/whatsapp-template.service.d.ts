import { Repository } from 'typeorm';
import { WhatsappTemplate } from '../entities/whatsapp-template.entity';
import { ConfigService } from '@nestjs/config';
import { WhatsappTemplateStatus, WhatsappTemplateCategory } from '../enums/whatsapp-template.enums';
export { WhatsappTemplateStatus, WhatsappTemplateCategory, WhatsappTemplateComponentType, WhatsappTemplateHeaderType, WhatsappTemplateButtonType } from '../enums/whatsapp-template.enums';
export declare class WhatsappTemplateService {
    private whatsappTemplateRepository;
    private configService;
    private readonly logger;
    constructor(whatsappTemplateRepository: Repository<WhatsappTemplate>, configService: ConfigService);
    findById(id: string, organizationId: string): Promise<WhatsappTemplate>;
    findByName(name: string, organizationId: string): Promise<WhatsappTemplate | null>;
    findAll(options: {
        organizationId: string;
        status?: WhatsappTemplateStatus | WhatsappTemplateStatus[];
        category?: WhatsappTemplateCategory | WhatsappTemplateCategory[];
        language?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        items: WhatsappTemplate[];
        total: number;
        page: number;
        limit: number;
    }>;
    create(data: Partial<WhatsappTemplate>): Promise<WhatsappTemplate>;
    update(id: string, organizationId: string, data: Partial<WhatsappTemplate>): Promise<WhatsappTemplate>;
    submitForApproval(id: string, organizationId: string): Promise<WhatsappTemplate>;
    delete(id: string, organizationId: string): Promise<void>;
    getAvailableLanguages(): Promise<{
        code: string;
        name: string;
    }[]>;
    processTemplateText(text: string, variables?: Record<string, any>): string;
    private validateTemplate;
    private submitTemplateToWhatsAppAPI;
    private deleteTemplateFromWhatsAppAPI;
    syncTemplatesFromWhatsAppAPI(organizationId: string): Promise<void>;
}
