import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { CustomRequest } from '../../../interfaces/request.interface';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, req: CustomRequest): Promise<import("../entities/user.entity").User>;
    findAll(query: UserQueryDto, req: CustomRequest): Promise<import("nestjs-typeorm-paginate").Pagination<import("../entities/user.entity").User, import("nestjs-typeorm-paginate").IPaginationMeta>>;
    getProfile(req: CustomRequest): Promise<import("../entities/user.entity").User>;
    updateProfile(updateProfileDto: UpdateProfileDto, req: CustomRequest): Promise<import("../entities/user.entity").User>;
    updatePassword(updatePasswordDto: UpdatePasswordDto, req: CustomRequest): Promise<void>;
    findOne(id: string, req: CustomRequest): Promise<import("../entities/user.entity").User>;
    update(id: string, updateUserDto: UpdateUserDto, req: CustomRequest): Promise<import("../entities/user.entity").User>;
    remove(id: string, req: CustomRequest): Promise<void>;
    activate(id: string, req: CustomRequest): Promise<import("../entities/user.entity").User>;
    deactivate(id: string, req: CustomRequest): Promise<import("../entities/user.entity").User>;
    getActivity(id: string, query: any, req: CustomRequest): Promise<import("../entities/user-activity.entity").UserActivity[]>;
    getPermissions(id: string, req: CustomRequest): Promise<string[]>;
}
