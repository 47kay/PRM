export declare enum EmailStatus {
    QUEUED = "QUEUED",
    SENDING = "SENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    BOUNCED = "BOUNCED"
}
export declare class EmailLog {
    id: string;
    jobId?: string;
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    template: string;
    context?: Record<string, any>;
    status: string;
    error?: string;
    organizationId?: string;
    userId?: string;
    createdAt: Date;
    sentAt?: Date;
}
