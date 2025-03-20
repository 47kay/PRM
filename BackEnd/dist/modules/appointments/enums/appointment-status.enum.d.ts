export declare enum AppointmentStatus {
    REQUESTED = "REQUESTED",
    PENDING = "PENDING",
    SCHEDULED = "SCHEDULED",
    CONFIRMED = "CONFIRMED",
    CHECKED_IN = "CHECKED_IN",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW",
    RESCHEDULED = "RESCHEDULED",
    WAITING_LIST = "WAITING_LIST",
    MISSED = "MISSED"
}
export type StatusMetadata = {
    value: AppointmentStatus;
    label: string;
    description: string;
    color: string;
    allowedTransitions: AppointmentStatus[];
};
export declare const STATUS_METADATA: Record<AppointmentStatus, StatusMetadata>;
