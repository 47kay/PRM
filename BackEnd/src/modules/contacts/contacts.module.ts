// src/modules/contacts/contacts.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsController } from './controllers/contacts.controller';
import { ContactsService } from './services/contacts.service';
import { Contact } from './entities/contact.entity';
import { ContactRelationship } from './entities/contact-relationship.entity';
import { MedicalHistory } from '../medical-history/medical-history.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Document } from '../documents/entities/document.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Contact,
            ContactRelationship,
            MedicalHistory,
            Appointment,
            Document
        ]),
        AuthModule,
        UsersModule,
        OrganizationsModule
    ],
    controllers: [ContactsController],
    providers: [ContactsService],
    exports: [ContactsService]
})
export class ContactsModule {}