import { IsOptional, IsEnum, IsUUID, IsString, IsArray, IsDate, IsBoolean, IsInt, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum TicketSortField {
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    PRIORITY = 'priority',
    STATUS = 'status',
    DUE_DATE = 'dueDate',
    LAST_ACTIVITY = 'lastActivity'
}

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC'
}

export class TicketQueryDto {
    @ApiPropertyOptional({
        description: 'Search term to filter tickets by title or description',
        example: 'login issue'
    })
    @IsOptional()
    @IsString()
    searchTerm?: string;

     @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  startDate?: string;

  @IsOptional()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Filter tickets by status',
        isArray: true,
        example: ['OPEN', 'IN_PROGRESS']
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    status?: string[];

    @ApiPropertyOptional({
        description: 'Filter tickets by priority',
        isArray: true,
        example: ['HIGH', 'URGENT']
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })

    @ApiPropertyOptional({
        description: 'Filter tickets by category',
        isArray: true,
        example: ['TECHNICAL', 'BILLING']
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    category?: string[];

    @ApiPropertyOptional({
        description: 'Filter tickets by assignee IDs',
        isArray: true
    })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    assigneeIds?: string[];

    @ApiPropertyOptional({
        description: 'Filter tickets by creator IDs',
        isArray: true
    })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    creatorIds?: string[];

    @ApiPropertyOptional({
        description: 'Filter tickets by tag names',
        isArray: true,
        example: ['bug', 'feature-request']
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({
        description: 'Filter tickets created after this date',
        type: Date
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    createdAfter?: Date;

    @ApiPropertyOptional({
        description: 'Filter tickets created before this date',
        type: Date
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    createdBefore?: Date;

    @ApiPropertyOptional({
        description: 'Filter tickets updated after this date',
        type: Date
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    updatedAfter?: Date;

    @ApiPropertyOptional({
        description: 'Filter tickets updated before this date',
        type: Date
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    updatedBefore?: Date;

    @ApiPropertyOptional({
        description: 'Filter tickets by due date range start',
        type: Date
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    dueDateStart?: Date;

    @ApiPropertyOptional({
        description: 'Filter tickets by due date range end',
        type: Date
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    dueDateEnd?: Date;

    @ApiPropertyOptional({
        description: 'Include archived tickets in results',
        default: false
    })
    @IsOptional()
    @IsBoolean()
    includeArchived?: boolean;

    @ApiPropertyOptional({
        description: 'Only return tickets that have unread updates',
        default: false
    })
    @IsOptional()
    @IsBoolean()
    hasUnreadUpdates?: boolean;

    @ApiPropertyOptional({
        description: 'Only return tickets that have attachments',
        default: false
    })
    @IsOptional()
    @IsBoolean()
    hasAttachments?: boolean;

    @ApiPropertyOptional({
        description: 'Field to sort tickets by',
        enum: TicketSortField,
        default: TicketSortField.CREATED_AT
    })
    @IsOptional()
    @IsEnum(TicketSortField)
    sortField?: TicketSortField;

    @ApiPropertyOptional({
        description: 'Sort order direction',
        enum: SortOrder,
        default: SortOrder.DESC
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;

    @ApiPropertyOptional({
        description: 'Number of tickets to return',
        minimum: 1,
        maximum: 100,
        default: 20
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)

    @ApiPropertyOptional({
        description: 'Number of tickets to skip',
        minimum: 0,
        default: 0
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    offset?: number = 0;

    @ApiPropertyOptional({
        description: 'Custom field filters',
        type: 'object'
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => Object)
    customFields?: Record<string, any>;

    @ApiPropertyOptional({
        description: 'Relation IDs to filter by',
        isArray: true
    })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    relatedTicketIds?: string[];

    @ApiPropertyOptional({
        description: 'Get tickets requiring attention',
        default: false
    })
    @IsOptional()
    @IsBoolean()
    requiresAttention?: boolean;

    @ApiPropertyOptional({
        description: 'Get tickets with SLA breaches',
        default: false
    })
    @IsOptional()
    @IsBoolean()
    hasSlaBreach?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by specific SLA status',
        example: ['warning', 'breached']
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    slaStatus?: string[];

    @ApiPropertyOptional({
        description: 'Fields to include in the response',
        isArray: true,
        example: ['id', 'title', 'status']
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    fields?: string[];
}