import { SmsTemplate } from '../entities/sms-template.entity';
export declare enum SmsStatus {
    PENDING = "pending",
    SENT = "sent",
    DELIVERED = "delivered",
    FAILED = "failed",
    UNDELIVERED = "undelivered",
    REJECTED = "rejected"
}
export declare class SmsLog {
    id: string;
    to: string;
    from: string;
    message: string;
    status: SmsStatus;
    statusMessage: string;
    externalId: string;
    organizationId: string;
    appointmentId: string;
    contactId: string;
    templateId: string;
    template: SmsTemplate;
    provider: string;
    variables: Record<string, any>;
    providerResponse: Record<string, any>;
    segments: number;
    cost: number;
    currency: string;
    ipAddress: string;
    createdAt: Date;
    updatedAt: Date;
    deliveredAt: Date;
    createdById: string;
    metadata: Record<string, any>;
}
