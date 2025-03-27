import { IsUUID } from 'class-validator';

export class MessageContextDto {
    @IsUUID()
    organizationId: string;

    @IsUUID()
    userId: string;
}