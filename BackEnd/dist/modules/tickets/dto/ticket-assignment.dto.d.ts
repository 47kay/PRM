export declare enum AssignmentType {
    USER = "user",
    TEAM = "team",
    DEPARTMENT = "department",
    AUTO = "auto",
    ROUND_ROBIN = "round_robin"
}
export declare class AssignmentNotification {
    notifyAssignee?: boolean;
    notifyPreviousAssignee?: boolean;
    customMessage?: string;
}
export declare class TicketAssignmentDto {
    assigneeId: string;
    note?: string;
}
export declare class AssignmentRules {
    considerWorkload?: boolean;
    checkSkillMatch?: boolean;
    considerTimeZone?: boolean;
    requiredSkills?: string[];
}
export declare class CreateTicketAssignmentDto {
    type: AssignmentType;
    assigneeId: string;
    notification?: AssignmentNotification;
    rules?: AssignmentRules;
    reason?: string;
    notes?: string[];
    isTemporary?: boolean;
    temporaryUntil?: Date;
}
export declare class UpdateTicketAssignmentDto {
    type?: AssignmentType;
    assigneeId?: string;
    notification?: AssignmentNotification;
    rules?: AssignmentRules;
    reason?: string;
}
export declare class BulkTicketAssignmentDto {
    ticketIds: string[];
    assigneeId: string;
    note?: string;
}
export declare class AssignmentResponseDto {
    success: boolean;
    ticketId: string;
    assigneeId: string;
    type: AssignmentType;
    error?: string;
    timestamp: Date;
    details?: Record<string, any>;
}
