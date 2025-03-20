import { AppointmentType } from '../enums/appointment-type.enum';
export interface AppointmentTypeMetadata {
    value: AppointmentType;
    label: string;
    description: string;
    defaultDuration: number;
    requiresPreparation: boolean;
    preparationInstructions?: string;
    category: 'PRIMARY' | 'SECONDARY' | 'SPECIALIZED';
    virtualEnabled: boolean;
}
export declare const APPOINTMENT_TYPE_METADATA: Record<AppointmentType, AppointmentTypeMetadata>;
