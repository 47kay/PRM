export declare enum AppointmentPriority {
    EMERGENCY = "EMERGENCY",
    URGENT = "URGENT",
    HIGH = "HIGH",
    NORMAL = "NORMAL",
    MEDIUM = "MEDIUM",
    LOW = "LOW",
    FOLLOW_UP = "FOLLOW_UP"
}
export type PriorityLevel = {
    value: AppointmentPriority;
    label: string;
    maxWaitTime: string;
    color: string;
};
export declare const PRIORITY_METADATA: Record<AppointmentPriority, PriorityLevel>;
