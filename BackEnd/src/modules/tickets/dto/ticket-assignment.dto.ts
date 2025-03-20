import { IsUUID, IsOptional, IsString, IsBoolean, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export enum AssignmentType {
    USER = 'user',
    TEAM = 'team',
    DEPARTMENT = 'department',
    AUTO = 'auto',
    ROUND_ROBIN = 'round_robin'
}

export class AssignmentNotification {
    @ApiProperty({
        description: 'Whether to notify the assignee',
        default: true
    })
    @IsBoolean()
    @IsOptional()
    notifyAssignee?: boolean = true;

    @ApiProperty({
        description: 'Whether to notify the previous assignee',
        default: true
    })
    @IsBoolean()
    @IsOptional()
    notifyPreviousAssignee?: boolean = true;

    @ApiProperty({
        description: 'Custom notification message',
        example: 'You have been assigned to handle this urgent support request.'
    })
    @IsString()
    @IsOptional()
    customMessage?: string;
}

export class TicketAssignmentDto {
    @ApiProperty({
      description: 'The ID of the user to assign the ticket to',
      example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    assigneeId: string;
  
    @ApiPropertyOptional({
      description: 'Optional note about the assignment',
      example: 'Assigning to support team lead for escalated issue'
    })
    @IsString()
    @IsOptional()
    note?: string;
  }

export class AssignmentRules {
    @ApiPropertyOptional({
        description: 'Whether to consider workload when assigning',
        default: true
    })
    @IsBoolean()
    @IsOptional()
    considerWorkload?: boolean = true;

    @ApiPropertyOptional({
        description: 'Whether to check for skill match',
        default: true
    })
    @IsBoolean()
    @IsOptional()
    checkSkillMatch?: boolean = true;

    @ApiPropertyOptional({
        description: 'Whether to consider time zones',
        default: false
    })
    @IsBoolean()
    @IsOptional()
    considerTimeZone?: boolean = false;

    @ApiPropertyOptional({
        description: 'Required skills for the assignment',
        type: [String]
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    requiredSkills?: string[];
}

export class CreateTicketAssignmentDto {
    @ApiProperty({
        description: 'Type of assignment',
        enum: AssignmentType,
        example: AssignmentType.USER
    })
    @IsEnum(AssignmentType)
    type: AssignmentType;

    @ApiProperty({
        description: 'ID of the assignee (user, team, or department)',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID('4')
    assigneeId: string;

    @ApiPropertyOptional({
        description: 'Notification settings for the assignment'
    })
    @ValidateNested()
    @Type(() => AssignmentNotification)
    @IsOptional()
    notification?: AssignmentNotification;

    @ApiPropertyOptional({
        description: 'Assignment rules and preferences'
    })
    @ValidateNested()
    @Type(() => AssignmentRules)
    @IsOptional()
    rules?: AssignmentRules;

    @ApiPropertyOptional({
        description: 'Reason for the assignment',
        example: 'Reassigned due to technical expertise required'
    })
    @IsString()
    @IsOptional()
    reason?: string;

    @ApiPropertyOptional({
        type: [String],
        description: 'Additional notes or comments about the assignment'
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    notes?: string[];

    @ApiPropertyOptional({
        description: 'Whether this is a temporary assignment',
        default: false
    })
    @IsBoolean()
    @IsOptional()
    isTemporary?: boolean = false;

    @ApiPropertyOptional({
        type: Date,
        description: 'If temporary, when the assignment should end'
    })
    @IsOptional()
    @Type(() => Date)
    temporaryUntil?: Date;
}

export class UpdateTicketAssignmentDto {
    @ApiPropertyOptional({
        enum: AssignmentType,
        description: 'Updated type of assignment'
    })
    @IsEnum(AssignmentType)
    @IsOptional()
    type?: AssignmentType;

    @ApiPropertyOptional({
        description: 'Updated assignee ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID('4')
    @IsOptional()
    assigneeId?: string;

    @ApiPropertyOptional({
        description: 'Updated notification settings'
    })
    @ValidateNested()
    @Type(() => AssignmentNotification)
    @IsOptional()
    notification?: AssignmentNotification;

    @ApiPropertyOptional({
        description: 'Updated assignment rules'
    })
    @ValidateNested()
    @Type(() => AssignmentRules)
    @IsOptional()
    rules?: AssignmentRules;

    @ApiPropertyOptional({
        description: 'Reason for updating the assignment',
        example: 'Adjusted assignment due to workload balancing'
    })
    @IsString()
    @IsOptional()
    reason?: string;
}

export class BulkTicketAssignmentDto {
    @ApiProperty({
      description: 'Array of ticket IDs to assign',
      example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
      type: [String]
    })
    @IsArray()
    @IsUUID('4', { each: true })
    @ArrayMinSize(1) // Moved this after IsArray and IsUUID to fix decorator type issues
    ticketIds: string[];
  
    @ApiProperty({
      description: 'The ID of the user to assign the tickets to',
      example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    assigneeId: string;
  
    @ApiPropertyOptional({
      description: 'Optional note about the bulk assignment',
      example: 'Assigning all pending tickets to the new support agent'
    })
    @IsString()
    @IsOptional()
    note?: string;
  }

export class AssignmentResponseDto {
    @ApiProperty({
        description: 'Whether the assignment was successful'
    })
    success: boolean;

    @ApiProperty({
        description: 'The ticket ID'
    })
    ticketId: string;

    @ApiProperty({
        description: 'The assignee ID'
    })
    assigneeId: string;

    @ApiProperty({
        description: 'Type of assignment',
        enum: AssignmentType
    })
    type: AssignmentType;

    @ApiPropertyOptional({
        description: 'Error message if assignment failed'
    })
    error?: string;

    @ApiProperty({
        description: 'Timestamp of the assignment'
    })
    timestamp: Date;

    @ApiPropertyOptional({
        description: 'Additional details about the assignment'
    })
    details?: Record<string, any>;
}
function ArrayMinSize(min: number, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'arrayMinSize',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [min],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [minSize] = args.constraints;
                    return Array.isArray(value) && value.length >= minSize;
                },
                defaultMessage(args: ValidationArguments) {
                    const [minSize] = args.constraints;
                    return `Array must contain at least ${minSize} elements`;
                }
            }
        });
    };
}
