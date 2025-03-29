import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Department } from '../entities/department.entity';
import { DepartmentsService } from './departments.service';
interface DepartmentTreeNode {
    id: string;
    name: string;
    managerId: string;
    memberCount: number;
    level: number;
    children: DepartmentTreeNode[];
    metadata?: Record<string, any>;
}
export declare class DepartmentHierarchyService {
    private readonly departmentRepository;
    private readonly departmentsService;
    private readonly eventEmitter;
    constructor(departmentRepository: Repository<Department>, departmentsService: DepartmentsService, eventEmitter: EventEmitter2);
    getDepartmentTree(organizationId: string, rootDepartmentId?: string): Promise<DepartmentTreeNode[]>;
    private buildDepartmentTree;
    moveDepartment(departmentId: string, newParentId: string | null, userId: string): Promise<void>;
    private validateHierarchyMove;
    private getAllChildDepartments;
    getDepartmentAncestors(departmentId: string): Promise<Department[]>;
    getDepartmentDescendants(departmentId: string): Promise<Department[]>;
    getDepartmentSiblings(departmentId: string): Promise<Department[]>;
    getDepartmentDepth(departmentId: string): Promise<number>;
    reorderDepartments(parentDepartmentId: string | null, orderedDepartmentIds: string[], userId: string): Promise<void>;
    updateDepartmentParent(departmentId: string, parentDepartmentId: string | null, userId: string): Promise<Department>;
    updateDepartmentOrder(departmentId: string, sortOrder: number, userId: string): Promise<Department>;
}
export {};
