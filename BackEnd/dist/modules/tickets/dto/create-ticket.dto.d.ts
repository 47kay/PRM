export declare enum TicketType {
    GENERAL = "GENERAL",
    TECHNICAL = "TECHNICAL",
    BILLING = "BILLING",
    MEDICAL = "MEDICAL",
    APPOINTMENT = "APPOINTMENT",
    ACCESS = "ACCESS",
    COMPLAINT = "COMPLAINT",
    FEEDBACK = "FEEDBACK"
}
export declare enum TicketPriority {
    LOW = "LOW",
    NORMAL = "NORMAL",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare enum TicketStatus {
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    PENDING = "PENDING",
    RESOLVED = "RESOLVED",
    CLOSED = "CLOSED",
    ESCALATED = "ESCALATED",
    REOPENED = "REOPENED",
    DELETED = "DELETED"
}
export declare enum TicketSource {
    WEB = "WEB",
    MOBILE = "MOBILE",
    EMAIL = "EMAIL",
    PHONE = "PHONE",
    CHAT = "CHAT",
    SYSTEM = "SYSTEM"
}
export declare class TicketAttachment {
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize?: string;
    description?: string;
}
export declare class CreateTicketDto {
    title: string;
    description: string;
    type: TicketType;
    priority?: TicketPriority;
    source?: TicketSource;
    contactId?: string;
    departmentId?: string;
    assigneeId?: string;
    category?: string;
    subCategory?: string;
    attachments?: TicketAttachment[];
    tags?: string[];
    referenceNumber?: string;
    relatedTicketId?: string;
    customFields?: {
        patientId?: string;
        appointmentId?: string;
        medicalRecordId?: string;
        insuranceInfo?: {
            provider?: string;
            policyNumber?: string;
        };
        deviceInfo?: {
            type?: string;
            model?: string;
            serialNumber?: string;
        };
        [key: string]: any;
    };
    isPrivate?: boolean;
    internalNotes?: string;
}
