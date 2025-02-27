export declare enum TicketSortField {
    CREATED_AT = "createdAt",
    UPDATED_AT = "updatedAt",
    PRIORITY = "priority",
    STATUS = "status",
    DUE_DATE = "dueDate",
    LAST_ACTIVITY = "lastActivity"
}
export declare enum SortOrder {
    ASC = "ASC",
    DESC = "DESC"
}
export declare class TicketQueryDto {
    searchTerm?: string;
    status?: string[];
    priority?: string[];
    category?: string[];
    assigneeIds?: string[];
    creatorIds?: string[];
    tags?: string[];
    createdAfter?: Date;
    createdBefore?: Date;
    updatedAfter?: Date;
    updatedBefore?: Date;
    dueDateStart?: Date;
    dueDateEnd?: Date;
    includeArchived?: boolean;
    hasUnreadUpdates?: boolean;
    hasAttachments?: boolean;
    sortField?: TicketSortField;
    sortOrder?: SortOrder;
    limit?: number;
    offset?: number;
    customFields?: Record<string, any>;
    relatedTicketIds?: string[];
    requiresAttention?: boolean;
    hasSlaBreach?: boolean;
    slaStatus?: string[];
    fields?: string[];
}
