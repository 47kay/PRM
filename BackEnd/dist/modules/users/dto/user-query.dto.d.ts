import { Role } from '../enums/role.enum';
export declare class UserQueryDto {
    search?: string;
    role?: Role;
    isActive?: boolean;
    department?: string;
    page?: number;
    limit?: number;
    roles?: Role[];
    departmentIds?: string[];
    hasVerifiedEmail?: boolean;
    relations?: string[];
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
    skip?: number;
    take?: number;
}
