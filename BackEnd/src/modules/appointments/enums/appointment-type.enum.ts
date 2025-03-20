export enum AppointmentType {
    INITIAL_CONSULTATION = 'INITIAL_CONSULTATION',    // First time visit
    FOLLOW_UP = 'FOLLOW_UP',                         // Follow-up visit
    ROUTINE_CHECKUP = 'ROUTINE_CHECKUP',             // Regular check-up
    SPECIALIST_CONSULTATION = 'SPECIALIST_CONSULTATION', // Specialist visit
    URGENT_CARE = 'URGENT_CARE',                     // Urgent care visit
    PROCEDURE = 'PROCEDURE',                         // Medical procedure
    SURGERY = 'SURGERY',                             // Surgical appointment
    DIAGNOSTIC = 'DIAGNOSTIC',                       // Tests and diagnostics
    THERAPY = 'THERAPY',                             // Therapy session
    VACCINATION = 'VACCINATION',                   // Vaccination appointment
    SCREENING = 'SCREENING',                         // Health screening
    TELEHEALTH = 'TELEHEALTH',                      // Virtual consultation
    LAB_WORK = 'LAB_WORK',                          // Laboratory tests
    IMAGING = 'IMAGING',                            // Medical imaging
    DENTAL = 'DENTAL',                              // Dental appointment
    PHARMACY = 'PHARMACY',                          // Pharmacy consultation
    IN_PERSON = 'IN_PERSON',
    VIRTUAL = 'VIRTUAL',
    PHONE = 'PHONE',
    HOME_VISIT = 'HOME_VISIT',
    EMERGENCY = 'EMERGENCY',
    CONSULTATION = 'CONSULTATION',
    MATERNITY = 'MATERNITY',
    SPECIALIZED = 'SPECIALIZED',
    PEDIATRIC = 'PEDIATRIC',
    WELLNESS_CHECK = 'WELLNESS_CHECK',
}

// Helper type for appointment type metadata
export type AppointmentTypeMetadata = {
    value: AppointmentType;
    label: string;
    description: string;
    defaultDuration: number;         // in minutes
    requiresPreparation: boolean;
    preparationInstructions?: string;
    category: 'PRIMARY' | 'SPECIALIST' | 'DIAGNOSTIC' | 'PROCEDURE' | 'OTHER';
    resources?: string[];           // Required resources/equipment
    virtualEnabled: boolean;        // Can be conducted virtually
};

// Helper constant for appointment type metadata
export const APPOINTMENT_TYPE_METADATA: Record<AppointmentType, AppointmentTypeMetadata> = {
    [AppointmentType.INITIAL_CONSULTATION]: {
        value: AppointmentType.INITIAL_CONSULTATION,
        label: 'Initial Consultation',
        description: 'First-time visit with healthcare provider',
        defaultDuration: 60,
        requiresPreparation: true,
        preparationInstructions: 'Please bring medical history and current medications list',
        category: 'PRIMARY',
        virtualEnabled: true
    },

    [AppointmentType.IN_PERSON]: {
        value: AppointmentType.IN_PERSON,
        label: 'In-Person Visit',
        description: 'Standard in-person medical visit',
        defaultDuration: 30,
        requiresPreparation: false,
        category: 'PRIMARY',
        virtualEnabled: false
    },

    [AppointmentType.FOLLOW_UP]: {
        value: AppointmentType.FOLLOW_UP,
        label: 'Follow-up Visit',
        description: 'Follow-up appointment to review progress',
        defaultDuration: 30,
        requiresPreparation: false,
        category: 'PRIMARY',
        virtualEnabled: true
    },
    [AppointmentType.ROUTINE_CHECKUP]: {
        value: AppointmentType.ROUTINE_CHECKUP,
        label: 'Routine Check-up',
        description: 'Regular health check-up',
        defaultDuration: 45,
        requiresPreparation: false,
        category: 'PRIMARY',
        virtualEnabled: false
    },
    [AppointmentType.SPECIALIST_CONSULTATION]: {
        value: AppointmentType.SPECIALIST_CONSULTATION,
        label: 'Specialist Consultation',
        description: 'Consultation with a specialist',
        defaultDuration: 60,
        requiresPreparation: true,
        preparationInstructions: 'Please bring referral and previous test results',
        category: 'SPECIALIST',
        virtualEnabled: true
    },
    [AppointmentType.URGENT_CARE]: {
        value: AppointmentType.URGENT_CARE,
        label: 'Urgent Care',
        description: 'Immediate medical attention required',
        defaultDuration: 45,
        requiresPreparation: false,
        category: 'PRIMARY',
        virtualEnabled: false
    },
    [AppointmentType.PROCEDURE]: {
        value: AppointmentType.PROCEDURE,
        label: 'Medical Procedure',
        description: 'Minor medical procedure',
        defaultDuration: 90,
        requiresPreparation: true,
        preparationInstructions: 'Specific preparation instructions will be provided',
        category: 'PROCEDURE',
        resources: ['Procedure Room', 'Standard Equipment'],
        virtualEnabled: false
    },
    [AppointmentType.SURGERY]: {
        value: AppointmentType.SURGERY,
        label: 'Surgery',
        description: 'Surgical procedure',
        defaultDuration: 180,
        requiresPreparation: true,
        preparationInstructions: 'Detailed pre-surgery instructions will be provided',
        category: 'PROCEDURE',
        resources: ['Operating Room', 'Surgical Equipment'],
        virtualEnabled: false
    },
    [AppointmentType.DIAGNOSTIC]: {
        value: AppointmentType.DIAGNOSTIC,
        label: 'Diagnostic Test',
        description: 'Medical diagnostic testing',
        defaultDuration: 45,
        requiresPreparation: true,
        preparationInstructions: 'Test-specific preparation instructions will be provided',
        category: 'DIAGNOSTIC',
        resources: ['Testing Equipment'],
        virtualEnabled: false
    },
    [AppointmentType.THERAPY]: {
        value: AppointmentType.THERAPY,
        label: 'Therapy Session',
        description: 'Therapeutic treatment session',
        defaultDuration: 60,
        requiresPreparation: false,
        category: 'OTHER',
        virtualEnabled: true
    },
    [AppointmentType.VACCINATION]: {
        value: AppointmentType.VACCINATION,
        label: 'Vaccination',
        description: 'Vaccine administration',
        defaultDuration: 30,
        requiresPreparation: false,
        category: 'PROCEDURE',
        resources: ['Vaccine Storage'],
        virtualEnabled: false
    },
    [AppointmentType.SCREENING]: {
        value: AppointmentType.SCREENING,
        label: 'Health Screening',
        description: 'Preventive health screening',
        defaultDuration: 45,
        requiresPreparation: true,
        preparationInstructions: 'Please follow screening-specific preparation guidelines',
        category: 'DIAGNOSTIC',
        virtualEnabled: false
    },
    [AppointmentType.TELEHEALTH]: {
        value: AppointmentType.TELEHEALTH,
        label: 'Telehealth Visit',
        description: 'Virtual healthcare consultation',
        defaultDuration: 30,
        requiresPreparation: false,
        category: 'PRIMARY',
        virtualEnabled: true
    },
    [AppointmentType.LAB_WORK]: {
        value: AppointmentType.LAB_WORK,
        label: 'Laboratory Tests',
        description: 'Laboratory testing and sample collection',
        defaultDuration: 30,
        requiresPreparation: true,
        preparationInstructions: 'Specific lab test preparation instructions will be provided',
        category: 'DIAGNOSTIC',
        resources: ['Lab Equipment'],
        virtualEnabled: false
    },
    [AppointmentType.IMAGING]: {
        value: AppointmentType.IMAGING,
        label: 'Medical Imaging',
        description: 'Medical imaging services',
        defaultDuration: 45,
        requiresPreparation: true,
        preparationInstructions: 'Imaging-specific preparation instructions will be provided',
        category: 'DIAGNOSTIC',
        resources: ['Imaging Equipment'],
        virtualEnabled: false
    },
    [AppointmentType.DENTAL]: {
        value: AppointmentType.DENTAL,
        label: 'Dental Visit',
        description: 'Dental care appointment',
        defaultDuration: 60,
        requiresPreparation: false,
        category: 'SPECIALIST',
        resources: ['Dental Equipment'],
        virtualEnabled: false
    },
    [AppointmentType.PHARMACY]: {
        value: AppointmentType.PHARMACY,
        label: 'Pharmacy Consultation',
        description: 'Consultation with pharmacist',
        defaultDuration: 30,
        requiresPreparation: false,
        category: 'OTHER',
        virtualEnabled: true
    },
    [AppointmentType.VIRTUAL]: {
        value: AppointmentType.VIRTUAL,
        label: 'Virtual Appointment',
        description: 'Virtual healthcare appointment',
        defaultDuration: 30,
        requiresPreparation: false,
        category: 'PRIMARY',
        virtualEnabled: true
    },
    [AppointmentType.PHONE]: {
        value: AppointmentType.PHONE,
        label: 'Phone Consultation',
        description: 'Consultation over the phone',
        defaultDuration: 20,
        requiresPreparation: false,
        category: 'PRIMARY',
        virtualEnabled: true
    },
    [AppointmentType.HOME_VISIT]: {
        value: AppointmentType.HOME_VISIT,
        label: 'Home Visit',
        description: 'Healthcare provider visits patient at home',
        defaultDuration: 60,
        requiresPreparation: true,
        preparationInstructions: 'Ensure a clean and safe environment for the visit',
        category: 'PRIMARY',
        virtualEnabled: false
    },
    [AppointmentType.EMERGENCY]: {
        value: AppointmentType.EMERGENCY,
        label: 'Emergency Visit',
        description: 'Emergency medical attention',
        defaultDuration: 120,
        requiresPreparation: false,
        category: 'PRIMARY',
        virtualEnabled: false
    },
    [AppointmentType.CONSULTATION]: {
        value: AppointmentType.CONSULTATION,
        label: 'General Consultation',
        description: 'General medical consultation',
        defaultDuration: 30,
        requiresPreparation: false,
        category: 'PRIMARY',
        virtualEnabled: true
    },
    [AppointmentType.MATERNITY]: {
        value: AppointmentType.MATERNITY,
        label: 'Maternity Care',
        description: 'Maternity care appointment',
        defaultDuration: 60,
        requiresPreparation: true,
        preparationInstructions: 'Bring maternity records and previous test results',
        category: 'SPECIALIST',
        virtualEnabled: false
    },
    [AppointmentType.SPECIALIZED]: {
        value: AppointmentType.SPECIALIZED,
        label: 'Specialized Care',
        description: 'Specialized medical care',
        defaultDuration: 60,
        requiresPreparation: true,
        preparationInstructions: 'Bring relevant medical records and test results',
        category: 'SPECIALIST',
        virtualEnabled: false
    },
    [AppointmentType.PEDIATRIC]: {
        value: AppointmentType.PEDIATRIC,
        label: 'Pediatric Care',
        description: 'Pediatric care appointment',
        defaultDuration: 45,
        requiresPreparation: false,
        category: 'SPECIALIST',
        virtualEnabled: false
    },
    [AppointmentType.WELLNESS_CHECK]: {
        value: AppointmentType.WELLNESS_CHECK,
        label: 'Wellness Check',
        description: 'Routine wellness check-up',
        defaultDuration: 30,
        requiresPreparation: false,
        category: 'PRIMARY',
        virtualEnabled: true
    }
};