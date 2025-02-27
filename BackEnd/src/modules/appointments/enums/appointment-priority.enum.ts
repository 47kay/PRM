

export enum AppointmentPriority {
    EMERGENCY = 'EMERGENCY',        // Immediate attention required
    URGENT = 'URGENT',             // Needs to be seen within 24 hours
    HIGH = 'HIGH',                 // Priority but not urgent (within 48-72 hours)
    NORMAL = 'NORMAL',            // Regular appointment priority
    MEDIUM = 'MEDIUM',             // Standard priority (within a week)
    LOW = 'LOW',                   // Routine appointment
    FOLLOW_UP = 'FOLLOW_UP'        // Regular follow-up appointment
}

// You can also add a helper type for priority levels if needed
export type PriorityLevel = {
    value: AppointmentPriority;
    label: string;
    maxWaitTime: string;
    color: string;
};

// Helper constant for priority metadata
export const PRIORITY_METADATA: Record<AppointmentPriority, PriorityLevel> = {
    [AppointmentPriority.EMERGENCY]: {
        value: AppointmentPriority.EMERGENCY,
        label: 'Emergency',
        maxWaitTime: 'Immediate',
        color: '#FF0000'  // Red
    },
    
    [AppointmentPriority.URGENT]: {
        value: AppointmentPriority.URGENT,
        label: 'Urgent',
        maxWaitTime: '24 hours',
        color: '#FFA500'  // Orange
    },
    [AppointmentPriority.HIGH]: {
        value: AppointmentPriority.HIGH,
        label: 'High Priority',
        maxWaitTime: '72 hours',
        color: '#FFFF00'  // Yellow
    },
    [AppointmentPriority.NORMAL]: {
        value: AppointmentPriority.NORMAL,
        label: 'Normal',
        maxWaitTime: '5 days',
        color: '#90EE90'  // Light Green
    },
    [AppointmentPriority.MEDIUM]: {
        value: AppointmentPriority.MEDIUM,
        label: 'Medium Priority',
        maxWaitTime: '1 week',
        color: '#00FF00'  // Green
    },
    [AppointmentPriority.LOW]: {
        value: AppointmentPriority.LOW,
        label: 'Low Priority',
        maxWaitTime: '2 weeks',
        color: '#0000FF'  // Blue
    },
    [AppointmentPriority.FOLLOW_UP]: {
        value: AppointmentPriority.FOLLOW_UP,
        label: 'Follow-up',
        maxWaitTime: 'As scheduled',
        color: '#808080'  // Gray
    }
};