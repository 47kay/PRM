import { WhatsappTemplateStatus, WhatsappTemplateCategory, WhatsappTemplateComponentType, WhatsappTemplateHeaderType, WhatsappTemplateButtonType } from '../enums/whatsapp-template.enums';
export { WhatsappTemplateStatus, WhatsappTemplateCategory, WhatsappTemplateComponentType, WhatsappTemplateHeaderType, WhatsappTemplateButtonType } from '../enums/whatsapp-template.enums';
export interface WhatsappTemplateButton {
    type: WhatsappTemplateButtonType;
    text: string;
    url?: string;
    phoneNumber?: string;
    payload?: string;
}
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
export declare class WhatsappTemplate {
    id: string;
    organizationId: string;
    name: string;
    description?: string;
    category: WhatsappTemplateCategory;
    status: WhatsappTemplateStatus;
    language: string;
    externalTemplateId?: string;
    components: WhatsappTemplateComponent[];
    isDefault: boolean;
    submittedAt?: Date;
    approvedAt?: Date;
    rejectionReason?: string;
    metadata?: Record<string, any>;
    useCount: number;
    lastUsedAt?: Date;
    createdById?: string;
    updatedById?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    getVariables(): string[];
    getBodyText(): string | null;
    getHeaderText(): string | null;
    processTemplate(variables?: Record<string, any>): {
        body: string;
        header?: string;
        footer?: string;
        buttons?: WhatsappTemplateButton[];
    };
    private processText;
}
