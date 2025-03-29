import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentsService } from './services/departments.service';
import { DepartmentMembersService } from './services/department-members.service';
import { DepartmentHierarchyService } from './services/department-hierarchy.service';
import { DepartmentAuditService } from './services/department-audit.service';
import { DepartmentsController } from './controllers/departments.controller';
import { Department } from './entities/department.entity';
import { DepartmentAuditLog } from './entities/department-audit-log.entity';
import { User } from '../users/entities/user.entity';  // Add User entity import

import { DepartmentAssignmentListener } from './listeners/department-assignment.listener';
import { DepartmentAuditListener } from './listeners/department-audit.listener';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module'; 
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      DepartmentAuditLog,
      User
    ]),
    OrganizationsModule,
    UsersModule,
    NotificationsModule,
    AuthModule
  ],
  controllers: [
    DepartmentsController
  ],
  providers: [
    // Core Services
    DepartmentsService,
    DepartmentMembersService,
    DepartmentHierarchyService,
    DepartmentAuditService,

    // Event Listeners
    DepartmentAssignmentListener,
    DepartmentAuditListener
  ],
  exports: [
    DepartmentsService,
    DepartmentMembersService,
    DepartmentHierarchyService,
    DepartmentAuditService,
    TypeOrmModule
  ]
})
export class DepartmentsModule {}