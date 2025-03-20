export declare enum AppointmentType {
    INITIAL_CONSULTATION = "INITIAL_CONSULTATION",
    FOLLOW_UP = "FOLLOW_UP",
    ROUTINE_CHECKUP = "ROUTINE_CHECKUP",
    SPECIALIST_CONSULTATION = "SPECIALIST_CONSULTATION",
    URGENT_CARE = "URGENT_CARE",
    PROCEDURE = "PROCEDURE",
    SURGERY = "SURGERY",
    DIAGNOSTIC = "DIAGNOSTIC",
    THERAPY = "THERAPY",
    VACCINATION = "VACCINATION",
    SCREENING = "SCREENING",
    TELEHEALTH = "TELEHEALTH",
    LAB_WORK = "LAB_WORK",
    IMAGING = "IMAGING",
    DENTAL = "DENTAL",
    PHARMACY = "PHARMACY",
    IN_PERSON = "IN_PERSON",
    VIRTUAL = "VIRTUAL",
    PHONE = "PHONE",
    HOME_VISIT = "HOME_VISIT",
    EMERGENCY = "EMERGENCY",
    CONSULTATION = "CONSULTATION",
    MATERNITY = "MATERNITY",
    SPECIALIZED = "SPECIALIZED",
    PEDIATRIC = "PEDIATRIC",
    WELLNESS_CHECK = "WELLNESS_CHECK"
}
export type AppointmentTypeMetadata = {
    value: AppointmentType;
    label: string;
    description: string;
    defaultDuration: number;
    requiresPreparation: boolean;
    preparationInstructions?: string;
    category: 'PRIMARY' | 'SPECIALIST' | 'DIAGNOSTIC' | 'PROCEDURE' | 'OTHER';
    resources?: string[];
    virtualEnabled: boolean;
};
export declare const APPOINTMENT_TYPE_METADATA: Record<AppointmentType, AppointmentTypeMetadata>;
