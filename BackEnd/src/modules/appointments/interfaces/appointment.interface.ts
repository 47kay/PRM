// src/modules/appointments/interfaces/appointment.interface.ts

import { AppointmentStatus } from '../enums/appointment-status.enum';
import { AppointmentType } from '../enums/appointment-type.enum';

export interface AppointmentInterface {
  id: string;
  patientId: string;
  doctorId: string;
  title: string;
  description?: string;
  scheduledFor: Date;
  duration: number; // duration in minutes
  type: AppointmentType;
  status: AppointmentStatus;
  location?: string;
  virtualMeetingLink?: string;
  reasonForVisit?: string;
  notes?: string;
  followUp?: boolean;
  followUpDate?: Date;
  insuranceRequired?: boolean;
  insuranceDetails?: {
    provider?: string;
    policyNumber?: string;
    coverageDetails?: string;
  };
  organizationId: string;
  createdById: string;
  updatedById?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  metadata?: Record<string, any>;
}

export interface AppointmentCreationParams {
  patientId: string;
  doctorId: string;
  title: string;
  description?: string;
  scheduledFor: Date;
  duration: number;
  type: AppointmentType;
  location?: string;
  virtualMeetingLink?: string;
  reasonForVisit?: string;
  notes?: string;
  followUp?: boolean;
  followUpDate?: Date;
  insuranceRequired?: boolean;
  insuranceDetails?: {
    provider?: string;
    policyNumber?: string;
    coverageDetails?: string;
  };
  organizationId: string;
  createdById: string;
  metadata?: Record<string, any>;
}

export interface AppointmentUpdateParams {
  title?: string;
  description?: string;
  scheduledFor?: Date;
  duration?: number;
  type?: AppointmentType;
  status?: AppointmentStatus;
  location?: string;
  virtualMeetingLink?: string;
  reasonForVisit?: string;
  notes?: string;
  followUp?: boolean;
  followUpDate?: Date;
  updatedById: string;
  metadata?: Record<string, any>;
}

export interface AppointmentFilterParams {
  doctorId?: string;
  patientId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: AppointmentStatus | AppointmentStatus[];
  type?: AppointmentType | AppointmentType[];
  organizationId: string;
  page?: number;
  limit?: number;
}

export interface AppointmentSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
  appointmentId?: string;
}

export interface AppointmentReminderConfig {
  enabled: boolean;
  timesBefore: number[]; // Minutes before appointment
  channels: ('email' | 'sms' | 'push' | 'whatsapp')[];
  templates?: {
    email?: string;
    sms?: string;
    push?: string;
    whatsapp?: string;
  };
}