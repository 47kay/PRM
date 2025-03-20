import { Contact } from '../../contacts/entities/contact.entity';
export declare enum DocumentType {
    MEDICAL_RECORD = "MEDICAL_RECORD",
    LAB_RESULT = "LAB_RESULT",
    PRESCRIPTION = "PRESCRIPTION",
    IMAGING = "IMAGING",
    INSURANCE = "INSURANCE",
    CONSENT_FORM = "CONSENT_FORM",
    IDENTIFICATION = "IDENTIFICATION",
    INVOICE = "INVOICE",
    RECEIPT = "RECEIPT",
    CORRESPONDENCE = "CORRESPONDENCE",
    REFERRAL = "REFERRAL",
    OTHER = "OTHER"
}
export declare enum DocumentStatus {
    DRAFT = "DRAFT",
    PENDING_REVIEW = "PENDING_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED",
    ARCHIVED = "ARCHIVED"
}
export declare class Document {
    id: string;
    organizationId: string;
    contactId: string;
    contact: Contact;
    name: string;
    type: DocumentType;
    fileName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
    fileUrl: string;
    description: string;
    status: DocumentStatus;
    isPrivate: boolean;
    documentDate: Date;
    expiryDate: Date;
    metadata: {
        author?: string;
        source?: string;
        keywords?: string[];
        version?: string;
        pageCount?: number;
        isOriginal?: boolean;
        relatedDocuments?: string[];
        customProperties?: Record<string, any>;
    };
    notes: string;
    tags: string[];
    shareWith: string[];
    appointmentId: string;
    medicalHistoryId: string;
    contentText: string;
    createdById: string;
    updatedById: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
