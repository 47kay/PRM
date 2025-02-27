export declare class CreateDepartmentDto {
    name: string;
    description?: string;
    parentDepartmentId?: string;
    managerId?: string;
    isActive?: boolean;
    contactEmail?: string;
    contactPhone?: string;
    workingHours?: string;
    timezone?: string;
    tags?: string[];
    metadata?: Record<string, any>;
}
