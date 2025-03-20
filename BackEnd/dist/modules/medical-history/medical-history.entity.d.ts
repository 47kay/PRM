import { Contact } from '../contacts/entities/contact.entity';
export declare enum EncounterType {
    CONSULTATION = "CONSULTATION",
    CHECKUP = "CHECKUP",
    PROCEDURE = "PROCEDURE",
    TREATMENT = "TREATMENT",
    FOLLOW_UP = "FOLLOW_UP",
    EMERGENCY = "EMERGENCY",
    LABORATORY = "LABORATORY",
    IMAGING = "IMAGING",
    TELEMEDICINE = "TELEMEDICINE",
    OTHER = "OTHER"
}
export declare enum HealthcareProviderType {
    PRIMARY_CARE = "PRIMARY_CARE",
    SPECIALIST = "SPECIALIST",
    DENTIST = "DENTIST",
    NURSE = "NURSE",
    THERAPIST = "THERAPIST",
    PHARMACIST = "PHARMACIST",
    OTHER = "OTHER"
}
export declare class MedicalHistory {
    id: string;
    organizationId: string;
    contactId: string;
    contact: Contact;
    encounterType: EncounterType;
    date: Date;
    description: string;
    diagnosis: string;
    treatment: string;
    medications: string;
    symptoms: string;
    vitalSigns: {
        bloodPressure?: string;
        temperature?: number;
        heartRate?: number;
        respiratoryRate?: number;
        oxygenSaturation?: number;
        height?: number;
        weight?: number;
        bmi?: number;
    };
    notes: string;
    referrals: {
        to: string;
        reason: string;
        date: Date;
        status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    }[];
    attachments: {
        id: string;
        name: string;
        type: string;
        url: string;
    }[];
    labResults: {
        test: string;
        result: string;
        normalRange: string;
        date: Date;
        isAbnormal: boolean;
    }[];
    isFlagged: boolean;
    flaggedReason: string;
    requiresFollowUp: boolean;
    followUpDate: Date;
    providerName: string;
    providerType: HealthcareProviderType;
    facilityName: string;
    facilityLocation: string;
    isInsuranceClaim: boolean;
    insuranceClaimNumber: string;
    costAmount: number;
    costCurrency: string;
    customFields: Record<string, any>;
    createdById: string;
    updatedById: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
