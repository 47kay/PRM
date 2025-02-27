// Contact Types
export interface Contact {
    id: number;
    name: string;
    email: string;
    phone: string;
    lastVisit: string;
    status: 'active' | 'inactive';
    type: 'patient' | 'family' | 'other';
    medicalInfo?: {
      bloodType?: string;
      allergies?: string[];
      conditions?: string[];
    };
    familyMembers?: FamilyMember[];
    appointments?: Appointment[];
    documents?: Document[];
  }
  
  export interface FamilyMember {
    id: number;
    name: string;
    relationship: string;
    phone?: string;
    email?: string;
  }
  
  export interface Appointment {
    id: number;
    date: string;
    time: string;
    type: string;
    doctor: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
  }
  
  export interface Document {
    id: number;
    name: string;
    type: string;
    uploadDate: string;
    size: number;
    url: string;
  }
  
  // User Types
  export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'doctor' | 'staff';
    permissions: string[];
  }
  
  // Organization Types
  export interface Organization {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    subscription: {
      plan: 'basic' | 'professional' | 'enterprise';
      status: 'active' | 'expired';
      expiryDate: string;
    };
  }