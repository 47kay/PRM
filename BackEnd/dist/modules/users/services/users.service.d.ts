import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../entities/user.entity';
import { UserActivity } from '../entities/user-activity.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { NotificationsService } from '../../notifications/services/notifications.service';
export declare class UsersService {
    private readonly userRepository;
    private readonly activityRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly notificationsService;
    findUsersByRole(organizationId: string, arg1: string): void;
    private readonly permissionsByRole;
    constructor(userRepository: Repository<User>, activityRepository: Repository<UserActivity>, dataSource: DataSource, eventEmitter: EventEmitter2, notificationsService: NotificationsService);
    findByRole(role: string, organizationId: string): Promise<User[]>;
    create(data: CreateUserDto & {
        organizationId: string;
        createdBy: string;
    }): Promise<User>;
    findById(id: string, relations?: string[]): Promise<User | null>;
    findAll(query: UserQueryDto & {
        organizationId: string;
    }): Promise<import("nestjs-typeorm-paginate").Pagination<User, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    findOne(id: string, organizationId: string): Promise<User>;
    update(id: string, data: UpdateUserDto & {
        organizationId: string;
        updatedBy: string;
    }): Promise<User>;
    updateProfile(id: string, data: UpdateProfileDto & {
        organizationId: string;
    }): Promise<User>;
    updatePassword(id: string, data: UpdatePasswordDto & {
        organizationId: string;
    }): Promise<void>;
    remove(id: string, organizationId: string): Promise<void>;
    activate(id: string, organizationId: string): Promise<User>;
    deactivate(id: string, organizationId: string): Promise<User>;
    getAdminCount(organizationId: string): Promise<number>;
    getActivity(id: string, query: {
        organizationId: string;
    }): Promise<UserActivity[]>;
    getPermissions(userId: string, organizationId: string): Promise<string[]>;
}
