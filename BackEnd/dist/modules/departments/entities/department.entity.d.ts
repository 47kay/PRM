import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
export declare class Department {
    id: string;
    name: string;
    organizationId: string;
    description?: string;
    parentDepartmentId?: string;
    managerId?: string;
    createdById?: string;
    updatedById?: string;
    isActive: boolean;
    memberCount: number;
    sortOrder: number;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    organization: Organization;
    parentDepartment?: Department;
    childDepartments: Department[];
    manager: Promise<User>;
    createdBy: Promise<User>;
    updatedBy: Promise<User>;
    tickets: Promise<Ticket[]>;
}
