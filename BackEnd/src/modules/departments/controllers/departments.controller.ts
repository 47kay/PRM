import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DepartmentsService } from '../services/departments.service';
import { DepartmentMembersService } from '../services/department-members.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { OrganizationGuard } from '../../organizations/guards/organization.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { AddMemberDto } from '../dto/add-member.dto';
import { DepartmentQueryDto } from '../dto/department-query.dto';
import { Department } from '../entities/department.entity';
import { Role } from '../../users/enums/role.enum';
import { User } from '../../users/entities/user.entity';

@ApiTags('Departments')
@Controller('organizations/:organizationId/departments')
@UseGuards(AuthGuard, OrganizationGuard, RolesGuard)
export class DepartmentsController {
  constructor(
    private readonly departmentsService: DepartmentsService,
    private readonly departmentMembersService: DepartmentMembersService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create department' })
  @ApiResponse({ status: 201, type: Department })
  async create(
    @Param('organizationId') organizationId: string,
    @Body() createDepartmentDto: CreateDepartmentDto,
    @CurrentUser('id') userId: string
  ): Promise<Department> {
    return this.departmentsService.create(
      organizationId,
      createDepartmentDto,
      userId
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, type: [Department] })
  async findAll(
    @Param('organizationId') organizationId: string,
    @Query() query: DepartmentQueryDto
  ): Promise<[Department[], number]> {
    return this.departmentsService.findAll(organizationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by id' })
  @ApiResponse({ status: 200, type: Department })
  async findOne(
    @Param('id') id: string
  ): Promise<Department> {
    return this.departmentsService.findById(id, ['manager', 'parentDepartment']);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update department' })
  @ApiResponse({ status: 200, type: Department })
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @CurrentUser('id') userId: string
  ): Promise<Department> {
    return this.departmentsService.update(id, updateDepartmentDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete department' })
  @ApiResponse({ status: 204 })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ): Promise<void> {
    await this.departmentsService.delete(id, userId);
  }

  @Post(':id/members')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Add member to department' })
  @ApiResponse({ status: 200 })
  async addMember(
    @Param('id') departmentId: string,
    @Body() addMemberDto: AddMemberDto,
    @CurrentUser('id') userId: string
  ): Promise<void> {
    await this.departmentMembersService.addMember(
      departmentId,
      addMemberDto.userId,
      userId
    );
  }

  @Delete(':id/members/:userId')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Remove member from department' })
  @ApiResponse({ status: 204 })
  async removeMember(
    @Param('id') departmentId: string,
    @Param('userId') memberId: string,
    @CurrentUser('id') userId: string
  ): Promise<void> {
    await this.departmentMembersService.removeMember(
      departmentId,
      memberId,
      userId
    );
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get department members' })
  @ApiResponse({ status: 200, type: [User] })
  async getMembers(
    @Param('id') departmentId: string,
    @Query() query: DepartmentQueryDto
  ): Promise<[User[], number]> {
    return this.departmentMembersService.getMembers(departmentId, query);
  }
}