import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DeepPartial } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Department } from '../entities/department.entity';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { DepartmentQueryDto } from '../dto/department-query.dto';
import { OrganizationsService } from '../../organizations/services/organizations.service';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly organizationsService: OrganizationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new department
   */
  async create(
    createDepartmentDto: Partial<Department>,
    userId: string,
    organizationId: string
  ): Promise<Department> {
    const department = this.departmentRepository.create({
      ...createDepartmentDto,
      organizationId,
      createdById: userId,
      updatedById: userId,
      isActive: true,
    });

    return await this.departmentRepository.save(department);
  }

  /**
   * Find all departments matching query
   */
  async findAll(
    organizationId: string,
    query: DepartmentQueryDto
  ): Promise<[Department[], number]> {
    const where: FindOptionsWhere<Department> = { organizationId };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.parentDepartmentId) {
      where.parentDepartmentId = query.parentDepartmentId;
    }

    if (query.managerId) {
      where.managerId = query.managerId;
    }

    return this.departmentRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: query.skip,
      take: query.take,
      relations: query.relations || [],
    });
  }

  /**
   * Find department by ID
   */
  async findById(
    id: string,
    organizationId?: string,
    relations?: string[]
  ): Promise<Department> {
    const where: FindOptionsWhere<Department> = { id };
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const department = await this.departmentRepository.findOne({
      where,
      relations: relations || []
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  /**
   * Update department
   */
  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
    userId: string
  ): Promise<Department> {
    const department = await this.findById(id);

    // Prevent circular parent-child relationship
    if (updateDepartmentDto.parentDepartmentId) {
      await this.validateParentDepartment(id, updateDepartmentDto.parentDepartmentId);
    }

    const updatedDepartment = await this.departmentRepository.save({
      ...department,
      ...updateDepartmentDto,
      updatedById: userId,
    });

    this.eventEmitter.emit('department.updated', {
      departmentId: id,
      organizationId: department.organizationId,
      updatedById: userId,
      changes: updateDepartmentDto,
    });

    return updatedDepartment;
  }

  /**
   * Delete department
   */
  async delete(id: string, userId: string): Promise<void> {
    const department = await this.findById(id);

    // Check if department has child departments
    const hasChildren = await this.departmentRepository.count({
      where: { parentDepartmentId: id },
    });

    if (hasChildren) {
      throw new BadRequestException(
        'Cannot delete department with child departments'
      );
    }

    await this.departmentRepository.softDelete(id);

    this.eventEmitter.emit('department.deleted', {
      departmentId: id,
      organizationId: department.organizationId,
      deletedById: userId,
    });
  }

  /**
   * Validate parent department relationship
   */
  private async validateParentDepartment(
    departmentId: string,
    parentId: string
  ): Promise<void> {
    if (departmentId === parentId) {
      throw new BadRequestException('Department cannot be its own parent');
    }

    const childDepartments = await this.findAllChildren(departmentId);
    if (childDepartments.some(dept => dept.id === parentId)) {
      throw new BadRequestException(
        'Cannot set a child department as parent department'
      );
    }
  }

  /**
   * Find all child departments
   */
  private async findAllChildren(departmentId: string): Promise<Department[]> {
    const children = await this.departmentRepository.find({
      where: { parentDepartmentId: departmentId },
    });

    const allChildren = [...children];

    for (const child of children) {
      const grandChildren = await this.findAllChildren(child.id);
      allChildren.push(...grandChildren);
    }

    return allChildren;
  }

  /**
   * Update member count
   */
  async updateMemberCount(id: string): Promise<void> {
    const count = await this.departmentRepository
      .createQueryBuilder('department')
      .leftJoin('department.members', 'member')
      .where('department.id = :id', { id })
      .getCount();

    await this.departmentRepository.update(id, { memberCount: count });
  }
}