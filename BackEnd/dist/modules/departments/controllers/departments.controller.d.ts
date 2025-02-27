import { DepartmentsService } from '../services/departments.service';
import { DepartmentMembersService } from '../services/department-members.service';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { AddMemberDto } from '../dto/add-member.dto';
import { DepartmentQueryDto } from '../dto/department-query.dto';
import { Department } from '../entities/department.entity';
import { User } from '../../users/entities/user.entity';
export declare class DepartmentsController {
    private readonly departmentsService;
    private readonly departmentMembersService;
    constructor(departmentsService: DepartmentsService, departmentMembersService: DepartmentMembersService);
    create(organizationId: string, createDepartmentDto: CreateDepartmentDto, userId: string): Promise<Department>;
    findAll(organizationId: string, query: DepartmentQueryDto): Promise<[Department[], number]>;
    findOne(id: string): Promise<Department>;
    update(id: string, updateDepartmentDto: UpdateDepartmentDto, userId: string): Promise<Department>;
    remove(id: string, userId: string): Promise<void>;
    addMember(departmentId: string, addMemberDto: AddMemberDto, userId: string): Promise<void>;
    removeMember(departmentId: string, memberId: string, userId: string): Promise<void>;
    getMembers(departmentId: string, query: DepartmentQueryDto): Promise<[User[], number]>;
}
