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
    UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../users/enums/role.enum';
import { OrganizationsService } from '../services/organizations.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { OrganizationQueryDto } from '../dto/organization-query.dto';
import { AddUserDto } from '../dto/add-user.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';
import { CustomRequest } from '../../../interfaces/request.interface';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm'; 

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrganizationsController {
    constructor(
        private readonly organizationsService: OrganizationsService,
        // @InjectRepository(User)
        // private readonly userRepository: Repository<User>
    ) {}

    @Post()
    async create(
        @Body() createOrganizationDto: CreateOrganizationDto,
        @Request() req: CustomRequest,
    ) {
        if (!req.user) {
            throw new UnauthorizedException('User not authenticated');
        }
    
        return this.organizationsService.create({
            ...createOrganizationDto,
            createdById: req.user.id,  // Just pass the ID
        });
    }
    @Get()
    @Roles(Role.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get all organizations' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return all organizations' })
    async findAll(
        @Query() query: OrganizationQueryDto,
    ) {
        return this.organizationsService.findAll(query);
    }

    @Get('current')
    @ApiOperation({ summary: 'Get current organization' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return current organization details' })
    async getCurrentOrganization(
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) {
            throw new UnauthorizedException('No organization context found');
        }

        return this.organizationsService.findOne(req.organization.id);
    }

    @Get(':id')
    @Roles(Role.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get organization by id' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return organization details' })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        const organization = await this.organizationsService.findOne(id);
        if (!organization) {
            throw new NotFoundException('Organization not found');
        }
        return organization;
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update organization' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Organization updated successfully' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateOrganizationDto: UpdateOrganizationDto,
        @Request() req: CustomRequest,
    ) {
        if (!req.user || !req.organization) {
            throw new UnauthorizedException('User or organization context not found');
        }

        // Only allow updating current organization unless super admin
        if (id !== req.organization.id && req.user.role !== Role.SUPER_ADMIN) {
            throw new ForbiddenException('Cannot update other organizations');
        }

        return this.organizationsService.update(id, {
            ...updateOrganizationDto,
            updatedBy: req.user.id,
        });
    }

    @Delete(':id')
    @Roles(Role.SUPER_ADMIN)
    @ApiOperation({ summary: 'Delete organization' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Organization deleted successfully' })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        await this.organizationsService.remove(id);
    }

    @Post(':id/users')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Add user to organization' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'User added successfully' })
    async addUser(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() addUserDto: AddUserDto,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) {
            throw new UnauthorizedException('No organization context found');
        }

        // Only allow adding users to current organization
        if (id !== req.organization.id) {
            throw new ForbiddenException('Cannot add users to other organizations');
        }

        return this.organizationsService.addUser(id, addUserDto);
    }

    @Delete(':id/users/:userId')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Remove user from organization' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'User removed successfully' })
    async removeUser(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('userId', ParseUUIDPipe) userId: string,
        @Request() req: CustomRequest,
    ) {
        if (!req.user || !req.organization) {
            throw new UnauthorizedException('User or organization context not found');
        }

        // Only allow removing users from current organization
        if (id !== req.organization.id) {
            throw new ForbiddenException('Cannot remove users from other organizations');
        }

        // Prevent removing the last admin
        if (req.user.id === userId) {
            const admins = await this.organizationsService.getAdminCount(id);
            if (admins === 1) {
                throw new BadRequestException('Cannot remove the last administrator');
            }
        }

        await this.organizationsService.removeUser(id, userId);
    }

    @Put(':id/subscription')
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @ApiOperation({ summary: 'Update organization subscription' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Subscription updated successfully' })
    async updateSubscription(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateSubscriptionDto: UpdateSubscriptionDto,
        @Request() req: CustomRequest,
    ) {
        if (!req.user || !req.organization) {
            throw new UnauthorizedException('User or organization context not found');
        }

        // Only allow updating current organization unless super admin
        if (id !== req.organization.id && req.user.role !== Role.SUPER_ADMIN) {
            throw new ForbiddenException('Cannot update other organizations\' subscriptions');
        }

        return this.organizationsService.updateSubscription(id, updateSubscriptionDto);
    }

    @Get(':id/statistics')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get organization statistics' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return organization statistics' })
    async getStatistics(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) {
            throw new UnauthorizedException('No organization context found');
        }

        // Only allow viewing current organization stats
        if (id !== req.organization.id) {
            throw new ForbiddenException('Cannot view other organizations\' statistics');
        }

        return this.organizationsService.getStatistics(id);
    }

    @Post(':id/verify-domain')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Verify organization domain' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Domain verified successfully' })
    async verifyDomain(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('domain') domain: string,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) {
            throw new UnauthorizedException('No organization context found');
        }

        // Only allow verifying current organization domain
        if (id !== req.organization.id) {
            throw new ForbiddenException('Cannot verify other organizations\' domains');
        }

        return this.organizationsService.verifyDomain(id, domain);
    }

    @Get(':id/audit-logs')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get organization audit logs' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return organization audit logs' })
    async getAuditLogs(
        @Param('id', ParseUUIDPipe) id: string,
        @Query() query: any,
        @Request() req: CustomRequest,
    ) {
        if (!req.organization) {
            throw new UnauthorizedException('No organization context found');
        }

        // Only allow viewing current organization logs
        if (id !== req.organization.id) {
            throw new ForbiddenException('Cannot view other organizations\' audit logs');
        }

        return this.organizationsService.getAuditLogs(id, query);
    }
}