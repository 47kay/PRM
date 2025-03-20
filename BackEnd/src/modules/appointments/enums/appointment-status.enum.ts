export enum AppointmentStatus {
    REQUESTED = 'REQUESTED',         // Initial request made
    PENDING = 'PENDING',            // Awaiting confirmation
    SCHEDULED = 'SCHEDULED', 
    CONFIRMED = 'CONFIRMED',        // Appointment confirmed
    CHECKED_IN = 'CHECKED_IN',      // Patient has arrived
    IN_PROGRESS = 'IN_PROGRESS',    // Currently being seen
    COMPLETED = 'COMPLETED',        // Appointment finished
    CANCELLED = 'CANCELLED',        // Cancelled by either party
    NO_SHOW = 'NO_SHOW',           // Patient didn't show up
    RESCHEDULED = 'RESCHEDULED',    // Appointment was rescheduled
    WAITING_LIST = 'WAITING_LIST',  // On waiting list for cancellation
    MISSED = 'MISSED',              // Missed appointment
    
}

// Helper type for status metadata
export type StatusMetadata = {
    value: AppointmentStatus;
    label: string;
    description: string;
    color: string;
    allowedTransitions: AppointmentStatus[];
};

// Helper constant for status metadata
export const STATUS_METADATA: Record<AppointmentStatus, StatusMetadata> = {
    [AppointmentStatus.REQUESTED]: {
        value: AppointmentStatus.REQUESTED,
        label: 'Requested',
        description: 'Appointment has been requested but not yet processed',
        color: '#FFA500', // Orange
        allowedTransitions: [
            AppointmentStatus.PENDING,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.CANCELLED,
            AppointmentStatus.WAITING_LIST
        ]
    },
    [AppointmentStatus.PENDING]: {
        value: AppointmentStatus.PENDING,
        label: 'Pending',
        description: 'Awaiting confirmation from provider',
        color: '#FFD700', // Gold
        allowedTransitions: [
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.CANCELLED,
            AppointmentStatus.WAITING_LIST
        ]
    },
    [AppointmentStatus.CONFIRMED]: {
        value: AppointmentStatus.CONFIRMED,
        label: 'Confirmed',
        description: 'Appointment has been confirmed',
        color: '#32CD32', // Lime Green
        allowedTransitions: [
            AppointmentStatus.CHECKED_IN,
            AppointmentStatus.CANCELLED,
            AppointmentStatus.NO_SHOW,
            AppointmentStatus.RESCHEDULED
        ]
    },
    [AppointmentStatus.SCHEDULED]: {
        value: AppointmentStatus.SCHEDULED,
        label: 'Scheduled',
        description: 'Appointment has been scheduled',
        color: '#20B2AA', // Light Sea Green
        allowedTransitions: [
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.CANCELLED,
            AppointmentStatus.RESCHEDULED
        ]
    },
    [AppointmentStatus.CHECKED_IN]: {
        value: AppointmentStatus.CHECKED_IN,
        label: 'Checked In',
        description: 'Patient has arrived for appointment',
        color: '#1E90FF', // Dodger Blue
        allowedTransitions: [
            AppointmentStatus.IN_PROGRESS,
            AppointmentStatus.CANCELLED
        ]
    },
    [AppointmentStatus.IN_PROGRESS]: {
        value: AppointmentStatus.IN_PROGRESS,
        label: 'In Progress',
        description: 'Appointment is currently in progress',
        color: '#4169E1', // Royal Blue
        allowedTransitions: [
            AppointmentStatus.COMPLETED
        ]
    },
    [AppointmentStatus.COMPLETED]: {
        value: AppointmentStatus.COMPLETED,
        label: 'Completed',
        description: 'Appointment has been completed',
        color: '#008000', // Green
        allowedTransitions: []
    },
    [AppointmentStatus.CANCELLED]: {
        value: AppointmentStatus.CANCELLED,
        label: 'Cancelled',
        description: 'Appointment was cancelled',
        color: '#FF0000', // Red
        allowedTransitions: [
            AppointmentStatus.REQUESTED,
            AppointmentStatus.RESCHEDULED
        ]
    },
    [AppointmentStatus.NO_SHOW]: {
        value: AppointmentStatus.NO_SHOW,
        label: 'No Show',
        description: 'Patient did not show up for appointment',
        color: '#8B0000', // Dark Red
        allowedTransitions: [
            AppointmentStatus.RESCHEDULED
        ]
    },
    [AppointmentStatus.RESCHEDULED]: {
        value: AppointmentStatus.RESCHEDULED,
        label: 'Rescheduled',
        description: 'Appointment has been rescheduled',
        color: '#9370DB', // Medium Purple
        allowedTransitions: [
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.CANCELLED
        ]
    },
    [AppointmentStatus.WAITING_LIST]: {
        value: AppointmentStatus.WAITING_LIST,
        label: 'Waiting List',
        description: 'Patient is on waiting list for cancellations',
        color: '#808080', // Gray
        allowedTransitions: [
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.CANCELLED
        ]
    },
    [AppointmentStatus.MISSED]: {
        value: AppointmentStatus.MISSED,
        label: 'Missed',
        description: 'Appointment was missed',
        color: '#A9A9A9', // Dark Gray
        allowedTransitions: [
            AppointmentStatus.RESCHEDULED
        ]
    }
};