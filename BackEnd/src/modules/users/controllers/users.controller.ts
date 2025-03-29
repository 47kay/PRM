// src/modules/users/controllers/users.controller.ts

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
    ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { CustomRequest } from '../../../interfaces/request.interface';
import { SimpleUserDto } from '../../../swagger/dtos/simple-user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Create new user' })
    @ApiResponse({ 
        status: HttpStatus.CREATED, 
        description: 'User created successfully',
        type: SimpleUserDto
    })
    async create(
        @Body() createUserDto: CreateUserDto,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) {
            throw new ForbiddenException('Organization context is required');
        }
        
        // Fix: Ensure req.user is defined
        if (!req.user) {
            throw new ForbiddenException('User context is required');
        }
        
        return this.usersService.create({
            ...createUserDto,
            organizationId: req.organization.id,
            createdBy: req.user.id,
        });
    }

    @Get()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Return all users',
        type: SimpleUserDto,
        isArray: true
    })
    async findAll(
        @Query() query: UserQueryDto,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) {
            throw new ForbiddenException('Organization context is required');
        }
        return this.usersService.findAll({
            ...query,
            organizationId: req.organization.id,
        });
    }

    @Get('profile')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Return current user profile',
        type: SimpleUserDto
    })
    async getProfile(
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) {
            throw new ForbiddenException('Organization context is required');
        }
        
        // Fix: Ensure req.user is defined
        if (!req.user) {
            throw new ForbiddenException('User context is required');
        }
        
        return this.usersService.findOne(req.user.id, req.organization.id);
    }

    @Put('profile')
    @ApiOperation({ summary: 'Update current user profile' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Profile updated successfully',
        type: SimpleUserDto
    })
    async updateProfile(
        @Body() updateProfileDto: UpdateProfileDto,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) {
            throw new ForbiddenException('Organization context is required');
        }
        
        // Fix: Ensure req.user is defined
        if (!req.user) {
            throw new ForbiddenException('User context is required');
        }
        
        return this.usersService.updateProfile(req.user.id, {
            ...updateProfileDto,
            organizationId: req.organization.id,
        });
    }

    @Put('profile/password')
    @ApiOperation({ summary: 'Update current user password' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Password updated successfully',
        type: SimpleUserDto
    })
    async updatePassword(
        @Body() updatePasswordDto: UpdatePasswordDto,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) {
            throw new ForbiddenException('Organization context is required');
        }
        
        // Fix: Ensure req.user is defined
        if (!req.user) {
            throw new ForbiddenException('User context is required');
        }
        
        return this.usersService.updatePassword(req.user.id, {
            ...updatePasswordDto,
            organizationId: req.organization.id,
        });
    }

    @Get(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get user by id' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Return user details',
        type: SimpleUserDto
    })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) {
            throw new ForbiddenException('Organization context is required');
        }
        const user = await this.usersService.findOne(id, req.organization.id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    @Put(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Update user' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'User updated successfully',
        type: SimpleUserDto
    })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) {
            throw new ForbiddenException('Organization context is required');
        }
        
        // Fix: Ensure req.user is defined
        if (!req.user) {
            throw new ForbiddenException('User context is required');
        }
        
        // Prevent demoting the last admin
        if (updateUserDto.role && updateUserDto.role !== Role.ADMIN) {
            const admins = await this.usersService.getAdminCount(req.organization.id);
            if (admins === 1) {
                const currentUser = await this.usersService.findOne(id, req.organization.id);
                if (currentUser.role === Role.ADMIN) {
                    throw new BadRequestException('Cannot demote the last administrator');
                }
            }
        }

        return this.usersService.update(id, {
            ...updateUserDto,
            organizationId: req.organization.id,
            updatedBy: req.user.id,
        });
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Delete user' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'User deleted successfully' })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) {
            throw new ForbiddenException('Organization context is required');
        }
        // Prevent deleting the last admin
        const user = await this.usersService.findOne(id, req.organization.id);
        if (user.role === Role.ADMIN) {
            const admins = await this.usersService.getAdminCount(req.organization.id);
            if (admins === 1) {
                throw new BadRequestException('Cannot delete the last administrator');
            }
        }

        await this.usersService.remove(id, req.organization.id);
    }

    @Put(':id/activate')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Activate user' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'User activated successfully',
        type: SimpleUserDto
    })
    async activate(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) {
            throw new ForbiddenException('Organization context is required');
        }
        return this.usersService.activate(id, req.organization.id);
    }

    @Put(':id/deactivate')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Deactivate user' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'User deactivated successfully',
        type: SimpleUserDto
    })
    async deactivate(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) {
            throw new ForbiddenException('Organization context is required');
        }
        // Prevent deactivating the last admin
        const user = await this.usersService.findOne(id, req.organization.id);
        if (user.role === Role.ADMIN) {
            const admins = await this.usersService.getAdminCount(req.organization.id);
            if (admins === 1) {
                throw new BadRequestException('Cannot deactivate the last administrator');
            }
        }

        return this.usersService.deactivate(id, req.organization.id);
    }

    @Get(':id/activity')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get user activity' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Return user activity',
        schema: {
            type: 'object',
            properties: {
                activities: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            action: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' }
                        }
                    }
                },
                total: { type: 'number' }
            }
        }
    })
    async getActivity(
        @Param('id', ParseUUIDPipe) id: string,
        @Query() query: any,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) {
            throw new ForbiddenException('Organization context is required');
        }
        return this.usersService.getActivity(id, {
            ...query,
            organizationId: req.organization.id,
        });
    }

    @Get(':id/permissions')
    @ApiOperation({ summary: 'Get user permissions' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Return user permissions',
        schema: {
            type: 'array',
            items: {
                type: 'string'
            }
        }
    })
    async getPermissions(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) {
            throw new ForbiddenException('Organization context is required');
        }
        return this.usersService.getPermissions(id, req.organization.id);
    }
}