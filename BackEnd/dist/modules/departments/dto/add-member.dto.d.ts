export declare enum DepartmentMemberRole {
    MANAGER = "MANAGER",
    SUPERVISOR = "SUPERVISOR",
    MEMBER = "MEMBER"
}
export declare class AddMemberDto {
    userId: string;
    role: DepartmentMemberRole;
    title?: string;
    responsibilities?: string;
    startDate?: string;
    metadata?: Record<string, any>;
}
