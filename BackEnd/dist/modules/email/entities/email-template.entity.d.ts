export declare enum EmailTemplateStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    INACTIVE = "inactive",
    ARCHIVED = "archived"
}
export declare enum EmailTemplateType {
    TRANSACTIONAL = "transactional",
    MARKETING = "marketing",
    NOTIFICATION = "notification",
    REPORT = "report",
    GENERAL = "general"
}
export declare class EmailTemplate {
    id: string;
    organizationId: string;
    name: string;
    description?: string;
    type: EmailTemplateType;
    status: EmailTemplateStatus;
    subject: string;
    content: string;
    plainTextContent?: string;
    isDefault: boolean;
    category?: string;
    language?: string;
    variables?: Record<string, {
        type: string;
        description?: string;
        required?: boolean;
        defaultValue?: any;
    }>;
    metadata?: Record<string, any>;
    previewText?: string;
    fromEmail?: string;
    fromName?: string;
    replyToEmail?: string;
    headerImageUrl?: string;
    footerContent?: string;
    createdById?: string;
    updatedById?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    lastUsedAt?: Date;
    useCount: number;
    processContent(variables: Record<string, any>): string;
    processSubject(variables: Record<string, any>): string;
}
