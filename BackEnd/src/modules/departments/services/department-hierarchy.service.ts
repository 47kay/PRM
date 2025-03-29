import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, IsNull } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Department } from '../entities/department.entity';
import { DepartmentsService } from './departments.service';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

interface DepartmentTreeNode {
  id: string;
  name: string;
  managerId: string;
  memberCount: number;
  level: number;
  children: DepartmentTreeNode[];
  metadata?: Record<string, any>;
}

@Injectable()
export class DepartmentHierarchyService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly departmentsService: DepartmentsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Get department hierarchy tree
   */
  async getDepartmentTree(
    organizationId: string,
    rootDepartmentId?: string
  ): Promise<DepartmentTreeNode[]> {
    const departments = await this.departmentRepository.find({
      where: { organizationId },
      order: { name: 'ASC' },
    });

    return this.buildDepartmentTree(departments, rootDepartmentId);
  }

  /**
   * Build department hierarchy tree
   */
  private buildDepartmentTree(
    departments: Department[],
    rootDepartmentId?: string,
    level: number = 0
  ): DepartmentTreeNode[] {
    const rootDepartments = departments.filter(dept => 
      rootDepartmentId 
        ? dept.id === rootDepartmentId
        : !dept.parentDepartmentId
    );

    return rootDepartments.map(dept => ({
      id: dept.id,
      name: dept.name,
      managerId: dept.managerId,
      memberCount: dept.memberCount,
      level,
      metadata: dept.metadata,
      children: this.buildDepartmentTree(
        departments.filter(d => d.parentDepartmentId === dept.id),
        undefined,
        level + 1
      ),
    }));
  }

  /**
   * Move department in hierarchy
   */
  async moveDepartment(
    departmentId: string,
    newParentId: string | null,
    userId: string
  ): Promise<void> {
    const department = await this.departmentsService.findById(departmentId);

    if (newParentId) {
      // Validate new parent exists and is in same organization
      const newParent = await this.departmentsService.findById(newParentId);
      
      if (newParent.organizationId !== department.organizationId) {
        throw new BadRequestException('Cannot move department to different organization');
      }

      // Check for circular reference
      await this.validateHierarchyMove(departmentId, newParentId);
    }

    // Update parent
    await this.departmentRepository.update(departmentId, {
      parentDepartmentId: newParentId || undefined,
      updatedById: userId,
    });

    this.eventEmitter.emit('department.moved', {
      departmentId,
      previousParentId: department.parentDepartmentId,
      newParentId,
      performedById: userId,
      organizationId: department.organizationId,
    });
  }

  /**
   * Validate hierarchy move to prevent circular references
   */
  private async validateHierarchyMove(
    departmentId: string,
    newParentId: string
  ): Promise<void> {
    if (departmentId === newParentId) {
      throw new BadRequestException('Department cannot be its own parent');
    }

    const childDepartments = await this.getAllChildDepartments(departmentId);
    if (childDepartments.some(dept => dept.id === newParentId)) {
      throw new BadRequestException('Cannot move department under its own child');
    }
  }

  /**
   * Get all child departments recursively
   */
  private async getAllChildDepartments(departmentId: string): Promise<Department[]> {
    const children = await this.departmentRepository.find({
      where: { parentDepartmentId: departmentId },
    });

    const allChildren = [...children];

    for (const child of children) {
      const grandChildren = await this.getAllChildDepartments(child.id);
      allChildren.push(...grandChildren);
    }

    return allChildren;
  }

  /**
   * Get department ancestors
   */
  async getDepartmentAncestors(departmentId: string): Promise<Department[]> {
    const ancestors: Department[] = [];
    let currentDepartment = await this.departmentsService.findById(
      departmentId,
      undefined, // organizationId is optional
      ['parentDepartment']
    );

    while (currentDepartment.parentDepartment) {
      ancestors.push(currentDepartment.parentDepartment);
      currentDepartment = await this.departmentsService.findById(
        currentDepartment.parentDepartment.id,
        undefined,
        ['parentDepartment']
      );
    }

    return ancestors.reverse();
  }

  /**
   * Get department descendants
   */
  async getDepartmentDescendants(departmentId: string): Promise<Department[]> {
    return this.getAllChildDepartments(departmentId);
  }

  /**
   * Get department siblings
   */
  async getDepartmentSiblings(departmentId: string): Promise<Department[]> {
    const department = await this.departmentsService.findById(
      departmentId,
      undefined,
      ['parentDepartment']
    );

    return this.departmentRepository.find({
      where: {
        parentDepartmentId: department.parentDepartmentId || IsNull(),
        id: Not(departmentId),
        organizationId: department.organizationId,
      },
    });
  }

  /**
   * Calculate department depth in hierarchy
   */
  async getDepartmentDepth(departmentId: string): Promise<number> {
    const ancestors = await this.getDepartmentAncestors(departmentId);
    return ancestors.length;
  }

  /**
   * Reorder sibling departments
   */
  async reorderDepartments(
    parentDepartmentId: string | null,
    orderedDepartmentIds: string[],
    userId: string
  ): Promise<void> {
    // Validate all departments exist and are siblings
    const departments = await this.departmentRepository.find({
      where: {
        id: In(orderedDepartmentIds),
        parentDepartmentId: parentDepartmentId || IsNull(),
      },
    });

    if (departments.length !== orderedDepartmentIds.length) {
      throw new BadRequestException('Invalid department IDs provided');
    }

    // Update order using sortOrder column
    for (let i = 0; i < orderedDepartmentIds.length; i++) {
      await this.departmentRepository.update(
        orderedDepartmentIds[i],
        {
          sortOrder: i,
          updatedById: userId,
        }
      );
    }

    this.eventEmitter.emit('department.reordered', {
      parentDepartmentId,
      orderedDepartmentIds,
      performedById: userId,
      organizationId: departments[0].organizationId,
    });
  }

  /**
   * Update department parent
   */
  async updateDepartmentParent(
    departmentId: string,
    parentDepartmentId: string | null,
    userId: string
  ): Promise<Department> {
    const updateData: QueryDeepPartialEntity<Department> = {
      parentDepartmentId,
      updatedById: userId
    };
    
    await this.departmentRepository.update(departmentId, updateData);
    return await this.departmentRepository.findOneOrFail({ where: { id: departmentId } });
  }

  /**
   * Update department order
   */
  async updateDepartmentOrder(
    departmentId: string,
    sortOrder: number,
    userId: string
  ): Promise<Department> {
    const updateData: QueryDeepPartialEntity<Department> = {
      sortOrder,
      updatedById: userId
    };
    
    await this.departmentRepository.update(departmentId, updateData);
    return await this.departmentRepository.findOneOrFail({ where: { id: departmentId } });
  }
}