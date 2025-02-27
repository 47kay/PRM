import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Department } from '../entities/department.entity';
import { User } from '../../users/entities/user.entity';
import { DepartmentQueryDto } from '../dto/department-query.dto';
import { UsersService } from '../../users/services/users.service';
import { DepartmentsService } from './departments.service';
export declare class DepartmentMembersService {
    private readonly departmentRepository;
    private readonly userRepository;
    private readonly usersService;
    private readonly departmentsService;
    private readonly eventEmitter;
    constructor(departmentRepository: Repository<Department>, userRepository: Repository<User>, usersService: UsersService, departmentsService: DepartmentsService, eventEmitter: EventEmitter2);
    addMember(departmentId: string, userId: string, performedById: string): Promise<void>;
    removeMember(departmentId: string, userId: string, performedById: string): Promise<void>;
    getMembers(departmentId: string, query: DepartmentQueryDto): Promise<[User[], number]>;
    transferMember(userId: string, fromDepartmentId: string, toDepartmentId: string, performedById: string): Promise<void>;
    getUserDepartments(userId: string): Promise<Department[]>;
    isMember(departmentId: string, userId: string): Promise<boolean>;
}
