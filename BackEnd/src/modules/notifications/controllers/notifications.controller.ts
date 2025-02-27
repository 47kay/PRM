// src/modules/notifications/controllers/notifications.controller.ts

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
import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { NotificationQueryDto } from '../dto/notification-query.dto';
import { NotificationPreferencesDto } from '../dto/notification-preferences.dto';
import { CustomRequest } from '../../../interfaces/request.interface';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Post()
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiOperation({ summary: 'Create new notification' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Notification created successfully' })
    async create(
        @Body() createNotificationDto: CreateNotificationDto,
        @Request() req: CustomRequest,
    ) {
        return this.notificationsService.create({
            ...createNotificationDto,
            organizationId: req.organization.id,
            senderId: req.user.id,
        });
    }

    @Get()
    @ApiOperation({ summary: 'Get user notifications' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return user notifications' })
    async findAll(
        @Query() query: NotificationQueryDto,
        @Request() req: CustomRequest,
    ) {
        return this.notificationsService.findAll({
            ...query,
            organizationId: req.organization.id,
            userId: req.user.id,
        });
    }

    @Get('unread')
    @ApiOperation({ summary: 'Get unread notifications count' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return unread notifications count' })
    async getUnreadCount(
        @Request() req: CustomRequest,
    ) {
        return this.notificationsService.getUnreadCount(
            req.user.id,
            req.organization.id,
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get notification by id' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return notification details' })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: CustomRequest,
    ) {
        const notification = await this.notificationsService.findOne(
            id,
            req.organization.id,
            req.user.id,
        );
        
        if (!notification) {
            throw new NotFoundException('Notification not found');
        }
        
        return notification;
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update notification' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Notification updated successfully' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateNotificationDto: UpdateNotificationDto,
        @Request() req: CustomRequest,
    ) {
        return this.notificationsService.update(id, {
            ...updateNotificationDto,
            organizationId: req.organization.id,
            userId: req.user.id,
        });
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete notification' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Notification deleted successfully' })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: CustomRequest,
    ) {
        await this.notificationsService.remove(
            id,
            req.organization.id,
            req.user.id,
        );
    }

    @Post(':id/mark-read')
    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Notification marked as read' })
    async markAsRead(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: CustomRequest,
    ) {
        return this.notificationsService.markAsRead(
            id,
            req.organization.id,
            req.user.id,
        );
    }

    @Post('mark-all-read')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    @ApiResponse({ status: HttpStatus.OK, description: 'All notifications marked as read' })
    async markAllAsRead(
        @Request() req: CustomRequest,
    ) {
        return this.notificationsService.markAllAsRead(
            req.organization.id,
            req.user.id,
        );
    }

    @Get('preferences')
    @ApiOperation({ summary: 'Get notification preferences' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return notification preferences' })
    async getPreferences(
        @Request() req: CustomRequest,
    ) {
        return this.notificationsService.getPreferences(
            req.organization.id,
            req.user.id,
        );
    }

    @Put('preferences')
    @ApiOperation({ summary: 'Update notification preferences' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Preferences updated successfully' })
    async updatePreferences(
        @Body() preferencesDto: NotificationPreferencesDto,
        @Request() req: CustomRequest,
    ) {
        return this.notificationsService.updatePreferences(
            preferencesDto,
            req.organization.id,
            req.user.id,
        );
    }

    @Post('test')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Send test notification' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Test notification sent successfully' })
    async sendTestNotification(
        @Body() data: { type: string },
        @Request() req: CustomRequest,
    ) {
        return this.notificationsService.sendTestNotification({
            ...data,
            organizationId: req.organization.id,
            userId: req.user.id,
        });
    }

    @Get('channels')
    @ApiOperation({ summary: 'Get available notification channels' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return available channels' })
    async getChannels(
        @Request() req: CustomRequest,
    ) {
        return this.notificationsService.getAvailableChannels(
            req.organization.id,
            req.user.id,
        );
    }
}