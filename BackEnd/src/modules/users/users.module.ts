// src/modules/users/users.module.ts
import { Module, forwardRef } from '@nestjs/common';  // Add forwardRef import
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UserActivityService } from './services/user-activity.service';

import { User } from './entities/user.entity';
import { UserActivity } from './entities/user-activity.entity';
import { UserSession } from './entities/user-session.entity';

import { UserEventListener } from './listeners/user.listener';
import { UserActivityListener } from './listeners/user-activity.listener';

import { NotificationsModule } from '../notifications/notifications.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            UserActivity,
            UserSession
        ]),
        EventEmitterModule.forRoot({
            wildcard: true,
            maxListeners: 20,
            verboseMemoryLeak: true,
        }),
        NotificationsModule,
        OrganizationsModule,
        forwardRef(() => AuthModule)  // Use forwardRef here
    ],
    controllers: [UsersController],
    providers: [
        UsersService,
        UserActivityService,
        UserEventListener,
        UserActivityListener
    ],
    exports: [UsersService]
})
export class UsersModule {}