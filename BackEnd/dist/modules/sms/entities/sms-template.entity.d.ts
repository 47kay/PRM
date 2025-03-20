export declare enum SmsTemplateType {
    APPOINTMENT_REMINDER = "appointment_reminder",
    APPOINTMENT_CONFIRMATION = "appointment_confirmation",
    APPOINTMENT_CANCELLATION = "appointment_cancellation",
    APPOINTMENT_RESCHEDULED = "appointment_rescheduled",
    APPOINTMENT_FOLLOWUP = "appointment_followup",
    GENERAL_NOTIFICATION = "general_notification",
    CUSTOM = "custom"
}
export declare class SmsTemplate {
    id: string;
    name: string;
    type: SmsTemplateType;
    content: string;
    description: string;
    isDefault: boolean;
    isActive: boolean;
    organizationId: string;
    createdById: string;
    updatedById: string;
    createdAt: Date;
    updatedAt: Date;
    sampleVariables: Record<string, string>;
    maxLength: number;
    metadata: Record<string, any>;
}
