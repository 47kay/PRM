export enum Role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    DOCTOR = 'DOCTOR',
    NURSE = 'NURSE',
    RECEPTIONIST = 'RECEPTIONIST',
    PATIENT = 'PATIENT',
    USER = 'USER',
    STAFF = "STAFF",
    AGENT = "AGENT",
    SUPERVISOR = "SUPERVISOR",
    CLIENT = "CLIENT",
    GUEST = "GUEST"
  }
  
  export const RoleHierarchy: Record<Role, number> = {
      [Role.SUPER_ADMIN]: 100,
      [Role.ADMIN]: 90,
      [Role.MANAGER]: 80,
      [Role.DOCTOR]: 70,
      [Role.NURSE]: 60,
      [Role.RECEPTIONIST]: 50,
      [Role.PATIENT]: 20,
      [Role.USER]: 10,
      [Role.STAFF]: 0,
      [Role.AGENT]: 0,
      [Role.SUPERVISOR]: 0,
      [Role.CLIENT]: 0,
      [Role.GUEST]: 0
  };
  
  export const RolePermissions: Record<Role, string[]> = {
      [Role.SUPER_ADMIN]: ['*'],
      [Role.ADMIN]: [
          'user:manage',
          'department:manage',
          'organization:manage',
          'appointment:manage',
          'patient:manage',
          'report:view'
      ],
      [Role.MANAGER]: [
          'department:view',
          'department:edit',
          'user:view',
          'appointment:manage',
          'patient:view',
          'report:view'
      ],
      [Role.DOCTOR]: [
          'appointment:view',
          'appointment:edit',
          'patient:view',
          'patient:edit',
          'prescription:manage'
      ],
      [Role.NURSE]: [
          'appointment:view',
          'patient:view',
          'patient:edit',
          'vitals:manage'
      ],
      [Role.RECEPTIONIST]: [
          'appointment:view',
          'appointment:schedule',
          'patient:view',
          'patient:register'
      ],
      [Role.PATIENT]: [
          'appointment:view',
          'appointment:schedule',
          'profile:edit'
      ],
      [Role.USER]: [
          'profile:view',
          'profile:edit'
      ],
      [Role.STAFF]: [],
      [Role.AGENT]: [],
      [Role.SUPERVISOR]: [],
      [Role.CLIENT]: [],
      [Role.GUEST]: []
  };
  
  /**
   * Check if role has permission
   */
  export function hasPermission(role: Role, permission: string): boolean {
    const permissions = RolePermissions[role];
    return permissions.includes('*') || permissions.includes(permission);
  }
  
  /**
   * Check if role has higher or equal hierarchy level
   */
  export function hasHigherOrEqualRole(userRole: Role, requiredRole: Role): boolean {
    return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
  }
  
  /**
   * Get role display name
   */
  export function getRoleDisplayName(role: Role): string {
    return role.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }