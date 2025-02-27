export declare enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    DOCTOR = "DOCTOR",
    NURSE = "NURSE",
    RECEPTIONIST = "RECEPTIONIST",
    PATIENT = "PATIENT",
    USER = "USER",
    STAFF = "STAFF",
    AGENT = "AGENT",
    SUPERVISOR = "SUPERVISOR",
    CLIENT = "CLIENT",
    GUEST = "GUEST"
}
export declare const RoleHierarchy: Record<Role, number>;
export declare const RolePermissions: Record<Role, string[]>;
export declare function hasPermission(role: Role, permission: string): boolean;
export declare function hasHigherOrEqualRole(userRole: Role, requiredRole: Role): boolean;
export declare function getRoleDisplayName(role: Role): string;
