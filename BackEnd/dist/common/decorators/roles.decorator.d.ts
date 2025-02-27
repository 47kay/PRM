import { Role } from '../../modules/users/enums/role.enum';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: Role[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const PERMISSIONS_KEY = "permissions";
export declare enum Permission {
    MANAGE_USERS = "manage_users",
    VIEW_USERS = "view_users",
    MANAGE_CONTACTS = "manage_contacts",
    VIEW_CONTACTS = "view_contacts",
    MANAGE_APPOINTMENTS = "manage_appointments",
    VIEW_APPOINTMENTS = "view_appointments",
    BOOK_APPOINTMENTS = "book_appointments",
    MANAGE_TICKETS = "manage_tickets",
    VIEW_TICKETS = "view_tickets",
    CREATE_TICKETS = "create_tickets",
    ASSIGN_TICKETS = "assign_tickets",
    SEND_MESSAGES = "send_messages",
    VIEW_MESSAGES = "view_messages",
    MANAGE_ORGANIZATION = "manage_organization",
    VIEW_ORGANIZATION = "view_organization",
    MANAGE_SETTINGS = "manage_settings",
    VIEW_SETTINGS = "view_settings"
}
export declare const Permissions: (...permissions: Permission[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const RolePermissions: Record<Role, Permission[]>;
export declare function hasPermission(role: Role, permission: Permission): boolean;
export declare function getRolePermissions(role: Role): Permission[];
