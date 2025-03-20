// src/modules/messages/controllers/messages.controller.ts

import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    HttpStatus,
    ParseUUIDPipe,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../users/enums/role.enum';
import { MessagesService } from '../services/messages.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { MessageQueryDto } from '../dto/message-query.dto';
import { Message } from '../entities/message.entity';
import { CustomRequest } from '../../../interfaces/request.interface';
import { MessageTemplateDto } from '../dto/message-template.dto';
import { BulkMessageDto } from '../dto/bulk-message.dto';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Post()
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiOperation({ summary: 'Create new message' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Message sent successfully' })
    async create(
        @Body() createMessageDto: CreateMessageDto,
        @Request() req: CustomRequest,
    ): Promise<Message> {
        // Added null checks with throw
        if (!req.organization) throw new BadRequestException('Organization information not available');
        if (!req.user) throw new BadRequestException('User information not available');
        
        return this.messagesService.create({
            ...createMessageDto,
            organizationId: req.organization.id,
            senderId: req.user.id,
        });
    }

    @Get()
    @ApiOperation({ summary: 'Get all messages' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return all messages' })
    async findAll(
        @Query() query: MessageQueryDto,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) throw new BadRequestException('Organization information not available');
        
        return this.messagesService.findAll({
            ...query,
            organizationId: req.organization.id,
        });
    }

    @Get('conversations')
    @ApiOperation({ summary: 'Get all conversations' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return all conversations' })
    async getConversations(
        @Query() query: MessageQueryDto,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) throw new BadRequestException('Organization information not available');
        
        return this.messagesService.getConversations({
            ...query,
            organizationId: req.organization.id,
        });
    }

    @Get('conversations/:contactId')
    @ApiOperation({ summary: 'Get conversation with contact' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return conversation messages' })
    async getConversation(
        @Param('contactId', ParseUUIDPipe) contactId: string,
        @Query() query: MessageQueryDto,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) throw new BadRequestException('Organization information not available');
        
        return this.messagesService.getConversation(contactId, {
            ...query,
            organizationId: req.organization.id,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get message by id' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return message details' })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: CustomRequest,
    ): Promise<Message> {
        if (!req.organization) throw new BadRequestException('Organization information not available');
        
        const message = await this.messagesService.findOne(id, req.organization.id);
        if (!message) {
            throw new NotFoundException('Message not found');
        }
        return message;
    }

    @Put(':id')
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiOperation({ summary: 'Update message' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Message updated successfully' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateMessageDto: UpdateMessageDto,
        @Request() req: CustomRequest,
    ): Promise<Message> {
        if (!req.organization) throw new BadRequestException('Organization information not available');
        if (!req.user) throw new BadRequestException('User information not available');
        
        return this.messagesService.update(id, {
            ...updateMessageDto,
            organizationId: req.organization.id,
            updatedBy: req.user.id,
        });
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Delete message' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Message deleted successfully' })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: CustomRequest,
    ): Promise<void> {
        if (!req.organization) throw new BadRequestException('Organization information not available');
        
        await this.messagesService.remove(id, req.organization.id);
    }

    @Post('templates')
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiOperation({ summary: 'Create message template' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Template created successfully' })
    async createTemplate(
        @Body() templateDto: MessageTemplateDto,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) throw new BadRequestException('Organization information not available');
        if (!req.user) throw new BadRequestException('User information not available');
        
        return this.messagesService.createTemplate({
            ...templateDto,
            organizationId: req.organization.id,
            createdBy: req.user.id,
        });
    }

    @Get('templates')
    @ApiOperation({ summary: 'Get message templates' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return message templates' })
    async getTemplates(
        @Query() query: MessageQueryDto,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) throw new BadRequestException('Organization information not available');
        
        return this.messagesService.getTemplates({
            ...query,
            organizationId: req.organization.id,
        });
    }

    @Post('bulk')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Send bulk messages' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Bulk messages queued successfully' })
    async sendBulk(
        @Body() bulkMessageDto: BulkMessageDto,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) throw new BadRequestException('Organization information not available');
        if (!req.user) throw new BadRequestException('User information not available');
        
        if (!bulkMessageDto.contactIds || bulkMessageDto.contactIds.length === 0) {
            throw new BadRequestException('Contact IDs are required for bulk messaging');
        }

        return this.messagesService.sendBulk({
            ...bulkMessageDto,
            organizationId: req.organization.id,
            senderId: req.user.id,
        });
    }

    @Get('statistics')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get messaging statistics' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return messaging statistics' })
    async getStatistics(
        @Query() query: MessageQueryDto,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) throw new BadRequestException('Organization information not available');
        
        return this.messagesService.getStatistics({
            ...query,
            organizationId: req.organization.id,
        });
    }

    @Post(':id/resend')
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiOperation({ summary: 'Resend failed message' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Message resent successfully' })
    async resend(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) throw new BadRequestException('Organization information not available');
        if (!req.user) throw new BadRequestException('User information not available');
        
        return this.messagesService.resend(id, {
            organizationId: req.organization.id,
            userId: req.user.id,
        });
    }

    @Post(':id/mark-read')
    @ApiOperation({ summary: 'Mark message as read' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Message marked as read' })
    async markAsRead(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) throw new BadRequestException('Organization information not available');
        if (!req.user) throw new BadRequestException('User information not available');
        
        return this.messagesService.markAsRead(id, {
            organizationId: req.organization.id,
            userId: req.user.id,
        });
    }
}