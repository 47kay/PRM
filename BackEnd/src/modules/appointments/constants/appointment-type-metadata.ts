// src/modules/appointments/constants/appointment-type-metadata.ts

import { AppointmentType } from '../enums/appointment-type.enum';

export interface AppointmentTypeMetadata {
  value: AppointmentType;
  label: string;
  description: string;
  defaultDuration: number; // in minutes
  requiresPreparation: boolean;
  preparationInstructions?: string;
  category: 'PRIMARY' | 'SECONDARY' | 'SPECIALIZED';
  virtualEnabled: boolean;
}

export const APPOINTMENT_TYPE_METADATA: Record<AppointmentType, AppointmentTypeMetadata> = {
  [AppointmentType.INITIAL_CONSULTATION]: {
    value: AppointmentType.INITIAL_CONSULTATION,
    label: 'Initial Consultation',
    description: 'First visit with a doctor to discuss health concerns',
    defaultDuration: 60,
    requiresPreparation: true,
    preparationInstructions: 'Please bring all medical records and a list of current medications',
    category: 'PRIMARY',
    virtualEnabled: true
  },
  
  [AppointmentType.IN_PERSON]: {
    value: AppointmentType.IN_PERSON,
    label: 'In-Person Visit',
    description: 'Face-to-face appointment at the clinic',
    defaultDuration: 30,
    requiresPreparation: false,
    category: 'PRIMARY',
    virtualEnabled: false
  },
  
  [AppointmentType.VIRTUAL]: {
    value: AppointmentType.VIRTUAL,
    label: 'Virtual Appointment',
    description: 'Remote consultation via video call',
    defaultDuration: 30,
    requiresPreparation: true,
    preparationInstructions: 'Ensure you have a stable internet connection and a private space',
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
    virtualEnabled: false
  },
  
  [AppointmentType.HOME_VISIT]: {
    value: AppointmentType.HOME_VISIT,
    label: 'Home Visit',
    description: 'Doctor visits patient at their residence',
    defaultDuration: 60,
    requiresPreparation: true,
    preparationInstructions: 'Please provide accurate address details and any special access instructions',
    category: 'SPECIALIZED',
    virtualEnabled: false
  },
  
  [AppointmentType.EMERGENCY]: {
    value: AppointmentType.EMERGENCY,
    label: 'Emergency',
    description: 'Urgent care appointment',
    defaultDuration: 45,
    requiresPreparation: false,
    category: 'PRIMARY',
    virtualEnabled: false
  },
  
  [AppointmentType.FOLLOW_UP]: {
    value: AppointmentType.FOLLOW_UP,
    label: 'Follow-Up',
    description: 'Review progress since previous appointment',
    defaultDuration: 20,
    requiresPreparation: false,
    category: 'SECONDARY',
    virtualEnabled: true
  },
  
  [AppointmentType.CONSULTATION]: {
    value: AppointmentType.CONSULTATION,
    label: 'General Consultation',
    description: 'General health consultation',
    defaultDuration: 30,
    requiresPreparation: false,
    category: 'PRIMARY',
    virtualEnabled: true
  },
  
  [AppointmentType.ROUTINE_CHECKUP]: {
    value: AppointmentType.ROUTINE_CHECKUP,
    label: 'Routine Checkup',
    description: 'Regular health assessment',
    defaultDuration: 30,
    requiresPreparation: false,
    category: 'PRIMARY',
    virtualEnabled: true
  },
  
  [AppointmentType.SPECIALIZED]: {
    value: AppointmentType.SPECIALIZED,
    label: 'Specialized Consultation',
    description: 'Consultation with a specialist',
    defaultDuration: 45,
    requiresPreparation: true,
    preparationInstructions: 'Please bring any referral documents and previous test results',
    category: 'SPECIALIZED',
    virtualEnabled: true
  },
  
  [AppointmentType.DIAGNOSTIC]: {
    value: AppointmentType.DIAGNOSTIC,
    label: 'Diagnostic Procedure',
    description: 'Tests and procedures to diagnose health conditions',
    defaultDuration: 45,
    requiresPreparation: true,
    preparationInstructions: 'Specific preparation instructions will be provided based on the diagnostic test',
    category: 'SPECIALIZED',
    virtualEnabled: false
  },
  
  [AppointmentType.THERAPY]: {
    value: AppointmentType.THERAPY,
    label: 'Therapy Session',
    description: 'Therapeutic intervention or treatment',
    defaultDuration: 60,
    requiresPreparation: false,
    category: 'SPECIALIZED',
    virtualEnabled: true
  },
  
  [AppointmentType.VACCINATION]: {
    value: AppointmentType.VACCINATION,
    label: 'Vaccination',
    description: 'Immunization or vaccine administration',
    defaultDuration: 15,
    requiresPreparation: true,
    preparationInstructions: 'Bring your immunization record. If you feel unwell on the day, please reschedule',
    category: 'PRIMARY',
    virtualEnabled: false
  },
  
  [AppointmentType.SCREENING]: {
    value: AppointmentType.SCREENING,
    label: 'Health Screening',
    description: 'Preventive screening for various health conditions',
    defaultDuration: 30,
    requiresPreparation: true,
    preparationInstructions: 'Specific preparation instructions will be provided based on the screening type',
    category: 'PRIMARY',
    virtualEnabled: false
  },
  
  [AppointmentType.SURGERY]: {
    value: AppointmentType.SURGERY,
    label: 'Surgical Procedure',
    description: 'Minor or major surgical intervention',
    defaultDuration: 120,
    requiresPreparation: true,
    preparationInstructions: 'Follow all pre-surgery instructions. No food or drink after midnight before surgery',
    category: 'SPECIALIZED',
    virtualEnabled: false
  },
  
  [AppointmentType.DENTAL]: {
    value: AppointmentType.DENTAL,
    label: 'Dental Appointment',
    description: 'Dental check-up or procedure',
    defaultDuration: 60,
    requiresPreparation: false,
    category: 'SPECIALIZED',
    virtualEnabled: false
  },
  
  [AppointmentType.PEDIATRIC]: {
    value: AppointmentType.PEDIATRIC,
    label: 'Pediatric Visit',
    description: 'Healthcare visit for children',
    defaultDuration: 30,
    requiresPreparation: false,
    category: 'PRIMARY',
    virtualEnabled: true
  },
  
  [AppointmentType.MATERNITY]: {
    value: AppointmentType.MATERNITY,
    label: 'Maternity Appointment',
    description: 'Prenatal, postnatal, or maternity care',
    defaultDuration: 45,
    requiresPreparation: true,
    preparationInstructions: 'Bring any prenatal records and recent test results',
    category: 'SPECIALIZED',
    virtualEnabled: true
  },
  
  [AppointmentType.PHARMACY]: {
    value: AppointmentType.PHARMACY,
    label: 'Pharmacy Consultation',
    description: 'Medication review or consultation with pharmacist',
    defaultDuration: 15,
    requiresPreparation: true,
    preparationInstructions: 'Bring a list of all medications you are currently taking',
    category: 'SECONDARY',
    virtualEnabled: true
  },
  
  [AppointmentType.SPECIALIST_CONSULTATION]: {
    value: AppointmentType.SPECIALIST_CONSULTATION,
    label: 'Specialist Consultation',
    description: 'Consultation with a medical specialist',
    defaultDuration: 45,
    requiresPreparation: true,
    preparationInstructions: 'Bring any referral documents and previous test results',
    category: 'SPECIALIZED',
    virtualEnabled: true
  },
  
  [AppointmentType.URGENT_CARE]: {
    value: AppointmentType.URGENT_CARE,
    label: 'Urgent Care',
    description: 'Immediate care for urgent medical issues',
    defaultDuration: 30,
    requiresPreparation: false,
    category: 'PRIMARY',
    virtualEnabled: false
  },
  
  [AppointmentType.PROCEDURE]: {
    value: AppointmentType.PROCEDURE,
    label: 'Medical Procedure',
    description: 'Scheduled medical procedure',
    defaultDuration: 60,
    requiresPreparation: true,
    preparationInstructions: 'Follow specific preparation instructions provided by your doctor',
    category: 'SPECIALIZED',
    virtualEnabled: false
  },
  
  [AppointmentType.TELEHEALTH]: {
    value: AppointmentType.TELEHEALTH,
    label: 'Telehealth Consultation',
    description: 'Remote consultation via telehealth platform',
    defaultDuration: 30,
    requiresPreparation: true,
    preparationInstructions: 'Ensure you have a stable internet connection and a private space',
    category: 'PRIMARY',
    virtualEnabled: true
  },
  
  [AppointmentType.WELLNESS_CHECK]: {
    value: AppointmentType.WELLNESS_CHECK,
    label: 'Wellness Check',
    description: 'Routine wellness check-up',
    defaultDuration: 30,
    requiresPreparation: false,
    category: 'PRIMARY',
    virtualEnabled: true
  },
  
  [AppointmentType.LAB_WORK]: {
    value: AppointmentType.LAB_WORK,
    label: 'Lab Work',
    description: 'Laboratory tests and procedures',
    defaultDuration: 30,
    requiresPreparation: true,
    preparationInstructions: 'Follow specific instructions provided for the lab test',
    category: 'SPECIALIZED',
    virtualEnabled: false
  },
  
  [AppointmentType.IMAGING]: {
    value: AppointmentType.IMAGING,
    label: 'Imaging',
    description: 'Radiology and imaging procedures',
    defaultDuration: 45,
    requiresPreparation: true,
    preparationInstructions: 'Follow specific instructions provided for the imaging procedure',
    category: 'SPECIALIZED',
    virtualEnabled: false
  }
};