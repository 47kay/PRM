// src/common/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { Role } from '../../modules/users/enums/role.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Permission decorator
export const PERMISSIONS_KEY = 'permissions';

export enum Permission {
    // User permissions
    MANAGE_USERS = 'manage_users',
    VIEW_USERS = 'view_users',

    // Contact permissions
    MANAGE_CONTACTS = 'manage_contacts',
    VIEW_CONTACTS = 'view_contacts',

    // Appointment permissions
    MANAGE_APPOINTMENTS = 'manage_appointments',
    VIEW_APPOINTMENTS = 'view_appointments',
    BOOK_APPOINTMENTS = 'book_appointments',

    // Ticket permissions
    MANAGE_TICKETS = 'manage_tickets',
    VIEW_TICKETS = 'view_tickets',
    CREATE_TICKETS = 'create_tickets',
    ASSIGN_TICKETS = 'assign_tickets',

    // Message permissions
    SEND_MESSAGES = 'send_messages',
    VIEW_MESSAGES = 'view_messages',

    // Organization permissions
    MANAGE_ORGANIZATION = 'manage_organization',
    VIEW_ORGANIZATION = 'view_organization',

    // Settings permissions
    MANAGE_SETTINGS = 'manage_settings',
    VIEW_SETTINGS = 'view_settings',
}

export const Permissions = (...permissions: Permission[]) => 
    SetMetadata(PERMISSIONS_KEY, permissions);

// Role definitions with associated permissions
export const RolePermissions: Record<Role, Permission[]> = {
    [Role.SUPER_ADMIN]: Object.values(Permission),
    [Role.ADMIN]: [
        Permission.MANAGE_USERS,
        Permission.VIEW_USERS,
        Permission.MANAGE_CONTACTS,
        Permission.VIEW_CONTACTS,
        Permission.MANAGE_APPOINTMENTS,
        Permission.VIEW_APPOINTMENTS,
        Permission.MANAGE_TICKETS,
        Permission.VIEW_TICKETS,
        Permission.SEND_MESSAGES,
        Permission.VIEW_MESSAGES,
        Permission.MANAGE_ORGANIZATION,
        Permission.VIEW_ORGANIZATION,
        Permission.MANAGE_SETTINGS,
        Permission.VIEW_SETTINGS,
    ],
    [Role.DOCTOR]: [
        Permission.VIEW_CONTACTS,
        Permission.MANAGE_APPOINTMENTS,
        Permission.VIEW_APPOINTMENTS,
        Permission.VIEW_TICKETS,
        Permission.CREATE_TICKETS,
        Permission.SEND_MESSAGES,
        Permission.VIEW_MESSAGES,
    ],
    [Role.STAFF]: [
        Permission.VIEW_CONTACTS,
        Permission.VIEW_APPOINTMENTS,
        Permission.BOOK_APPOINTMENTS,
        Permission.VIEW_TICKETS,
        Permission.CREATE_TICKETS,
        Permission.SEND_MESSAGES,
        Permission.VIEW_MESSAGES,
    ],
    [Role.RECEPTIONIST]: [
        Permission.VIEW_CONTACTS,
        Permission.BOOK_APPOINTMENTS,
        Permission.VIEW_APPOINTMENTS,
        Permission.CREATE_TICKETS,
        Permission.VIEW_TICKETS,
        Permission.SEND_MESSAGES,
        Permission.VIEW_MESSAGES,
    ],
    [Role.AGENT]: [],
    [Role.SUPERVISOR]: [],
    [Role.CLIENT]: [],
    [Role.USER]: [],
    [Role.GUEST]: [],
    [Role.MANAGER]: [],
    [Role.NURSE]: [],
    [Role.PATIENT]: []
};

// Helper function to check if a role has a specific permission
export function hasPermission(role: Role, permission: Permission): boolean {
    return RolePermissions[role]?.includes(permission) || false;
}

// Helper function to get all permissions for a role
export function getRolePermissions(role: Role): Permission[] {
    return RolePermissions[role] || [];
}

// Example usage:
/*
@Roles(Role.ADMIN, Role.DOCTOR)
@Get('protected-route')
protectedEndpoint() {
    return 'Only admins and doctors can access this';
}

@Permissions(Permission.MANAGE_APPOINTMENTS)
@Get('manage-appointments')
manageAppointments() {
    return 'Only users with MANAGE_APPOINTMENTS permission can access this';
}

@Roles(Role.ADMIN)
@Permissions(Permission.MANAGE_USERS, Permission.VIEW_USERS)
@Get('manage-users')
manageUsers() {
    return 'Only admins with specific permissions can access this';
}
*/