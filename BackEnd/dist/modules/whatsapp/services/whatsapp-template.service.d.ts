import { Repository } from 'typeorm';
import { WhatsappTemplate } from '../entities/whatsapp-template.entity';
import { ConfigService } from '@nestjs/config';
export declare enum WhatsappTemplateStatus {
    DRAFT = "draft",
    PENDING_APPROVAL = "pending_approval",
    APPROVED = "approved",
    REJECTED = "rejected",
    ACTIVE = "active",
    INACTIVE = "inactive",
    DELETED = "deleted"
}
export declare enum WhatsappTemplateCategory {
    ACCOUNT_UPDATE = "account_update",
    PAYMENT_UPDATE = "payment_update",
    PERSONAL_FINANCE_UPDATE = "personal_finance_update",
    SHIPPING_UPDATE = "shipping_update",
    RESERVATION_UPDATE = "reservation_update",
    ISSUE_RESOLUTION = "issue_resolution",
    APPOINTMENT_UPDATE = "appointment_update",
    TRANSPORTATION_UPDATE = "transportation_update",
    TICKET_UPDATE = "ticket_update",
    ALERT_UPDATE = "alert_update",
    AUTO_REPLY = "auto_reply",
    TRANSACTIONAL = "transactional",
    MARKETING = "marketing",
    UTILITY = "utility",
    AUTHENTICATION = "authentication"
}
export declare enum WhatsappTemplateComponentType {
    HEADER = "header",
    BODY = "body",
    FOOTER = "footer",
    BUTTONS = "buttons"
}
export declare enum WhatsappTemplateHeaderType {
    TEXT = "text",
    IMAGE = "image",
    VIDEO = "video",
    DOCUMENT = "document",
    LOCATION = "location"
}
export declare enum WhatsappTemplateButtonType {
    PHONE_NUMBER = "phone_number",
    URL = "url",
    QUICK_REPLY = "quick_reply"
}
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
