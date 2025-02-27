import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
export declare enum TemplateStatus {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    PAUSED = "PAUSED",
    DELETED = "DELETED"
}
export declare enum TemplateCategory {
    MARKETING = "MARKETING",
    UTILITY = "UTILITY",
    AUTHENTICATION = "AUTHENTICATION",
    APPOINTMENT = "APPOINTMENT",
    PAYMENT = "PAYMENT",
    CUSTOMER_SUPPORT = "CUSTOMER_SUPPORT"
}
export declare enum TemplateLanguage {
    EN = "en",
    ES = "es",
    PT = "pt",
    FR = "fr",
    DE = "de",
    IT = "it",
    AR = "ar",
    HI = "hi",
    ZH = "zh"
}
export declare class WhatsAppTemplate {
    id: string;
    organizationId: string;
    organization: Organization;
    name: string;
    category: TemplateCategory;
    language: TemplateLanguage;
    content: string;
    components: {
        type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
        text?: string;
        format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
        example?: Record<string, any>;
    }[];
    variables: string[];
    sampleValues: Record<string, string[]>;
    status: TemplateStatus;
    whatsappTemplateId: string | undefined;
    rejectionReason: string;
    allowedTags: string[];
    description: string;
    metadata: Record<string, any>;
    version: number;
    expiresAt: Date;
    isActive: boolean;
    usageCount: number;
    createdById: string;
    createdBy: User;
    updatedById: string;
    updatedBy: User;
    approvedById: string | null;
    approvedBy: User;
    approvedAt: Date | undefined;
    createdAt: Date;
    updatedAt: Date;
    headerType: any;
    buttons: any;
    isEditable(): boolean;
    canSubmitForApproval(): boolean;
    isUsable(): boolean;
    isExpired(): boolean;
    validateVariables(values: Record<string, string>): boolean;
    createNewVersion(): WhatsAppTemplate;
    generateUniqueId(): string;
    incrementUsage(): void;
}
