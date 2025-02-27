import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Department } from '../entities/department.entity';
import { User } from '../../users/entities/user.entity';
import { DepartmentQueryDto } from '../dto/department-query.dto';
import { UsersService } from '../../users/services/users.service';
import { DepartmentsService } from './departments.service';

@Injectable()
export class DepartmentMembersService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly departmentsService: DepartmentsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Add member to department
   */
  async addMember(
    departmentId: string,
    userId: string,
    performedById: string
  ): Promise<void> {
    const department = await this.departmentsService.findById(departmentId);
    const user = await this.usersService.findById(userId);

    // Check if user is already a member
    const isMember = await this.departmentRepository
      .createQueryBuilder('department')
      .innerJoin('department.members', 'member')
      .where('department.id = :departmentId', { departmentId })
      .andWhere('member.id = :userId', { userId })
      .getExists();

    if (isMember) {
      throw new BadRequestException('User is already a member of this department');
    }

    // Add member
    await this.departmentRepository
      .createQueryBuilder()
      .relation(Department, 'members')
      .of(department)
      .add(user);

    // Update member count
    await this.departmentsService.updateMemberCount(departmentId);

    this.eventEmitter.emit('department.member.added', {
      departmentId,
      userId,
      performedById,
      organizationId: department.organizationId,
    });
  }

  /**
   * Remove member from department
   */
  async removeMember(
    departmentId: string,
    userId: string,
    performedById: string
  ): Promise<void> {
    const department = await this.departmentsService.findById(departmentId);

    // Check if user is a member
    const isMember = await this.departmentRepository
      .createQueryBuilder('department')
      .innerJoin('department.members', 'member')
      .where('department.id = :departmentId', { departmentId })
      .andWhere('member.id = :userId', { userId })
      .getExists();

    if (!isMember) {
      throw new BadRequestException('User is not a member of this department');
    }

    // Check if user is department manager
    if (department.managerId === userId) {
      throw new BadRequestException('Cannot remove department manager from department');
    }

    // Remove member
    await this.departmentRepository
      .createQueryBuilder()
      .relation(Department, 'members')
      .of(department)
      .remove(userId);

    // Update member count
    await this.departmentsService.updateMemberCount(departmentId);

    this.eventEmitter.emit('department.member.removed', {
      departmentId,
      userId,
      performedById,
      organizationId: department.organizationId,
    });
  }

  /**
   * Get department members
   */
  async getMembers(
    departmentId: string,
    query: DepartmentQueryDto
  ): Promise<[User[], number]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.departments', 'department')
      .where('department.id = :departmentId', { departmentId });

    if (query.search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    return queryBuilder
      .orderBy('user.firstName', 'ASC')
      .addOrderBy('user.lastName', 'ASC')
      .skip(query.skip)
      .take(query.take)
      .getManyAndCount();
  }

  /**
   * Transfer member to another department
   */
  async transferMember(
    userId: string,
    fromDepartmentId: string,
    toDepartmentId: string,
    performedById: string
  ): Promise<void> {
    // Remove from old department
    await this.removeMember(fromDepartmentId, userId, performedById);

    // Add to new department
    await this.addMember(toDepartmentId, userId, performedById);

    const fromDepartment = await this.departmentsService.findById(fromDepartmentId);

    this.eventEmitter.emit('department.member.transferred', {
      userId,
      fromDepartmentId,
      toDepartmentId,
      performedById,
      organizationId: fromDepartment.organizationId,
    });
  }

  /**
   * Get user's departments
   */
  async getUserDepartments(userId: string): Promise<Department[]> {
    return this.departmentRepository
      .createQueryBuilder('department')
      .innerJoin('department.members', 'member')
      .where('member.id = :userId', { userId })
      .getMany();
  }

  /**
   * Check if user is member of department
   */
  async isMember(departmentId: string, userId: string): Promise<boolean> {
    return this.departmentRepository
      .createQueryBuilder('department')
      .innerJoin('department.members', 'member')
      .where('department.id = :departmentId', { departmentId })
      .andWhere('member.id = :userId', { userId })
      .getExists();
  }
}