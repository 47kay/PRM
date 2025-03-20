// src/modules/organizations/interfaces/staff-member.interface.ts

export interface StaffMember {
    id: string;
    name?: string;
    email?: string;
    role: string;
    organizationId: string;
    // Add any other properties your staff members have
  }