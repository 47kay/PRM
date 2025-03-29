import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Department } from '../entities/department.entity';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { DepartmentQueryDto } from '../dto/department-query.dto';
import { OrganizationsService } from '../../organizations/services/organizations.service';
export declare class DepartmentsService {
    private readonly departmentRepository;
    private readonly organizationsService;
    private readonly eventEmitter;
    constructor(departmentRepository: Repository<Department>, organizationsService: OrganizationsService, eventEmitter: EventEmitter2);
    create(createDepartmentDto: Partial<Department>, userId: string, organizationId: string): Promise<Department>;
    findAll(organizationId: string, query: DepartmentQueryDto): Promise<[Department[], number]>;
    findById(id: string, organizationId?: string, relations?: string[]): Promise<Department>;
    update(id: string, updateDepartmentDto: UpdateDepartmentDto, userId: string): Promise<Department>;
    delete(id: string, userId: string): Promise<void>;
    private validateParentDepartment;
    private findAllChildren;
    updateMemberCount(id: string): Promise<void>;
}
