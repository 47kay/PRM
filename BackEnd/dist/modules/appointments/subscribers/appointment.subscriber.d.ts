import { EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent, Connection } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Appointment } from '../entities/appointment.entity';
export declare class AppointmentSubscriber implements EntitySubscriberInterface<Appointment> {
    private eventEmitter;
    constructor(connection: Connection, eventEmitter: EventEmitter2);
    listenTo(): typeof Appointment;
    afterInsert(event: InsertEvent<Appointment>): void;
    afterUpdate(event: UpdateEvent<Appointment>): void;
    afterSoftRemove(event: RemoveEvent<Appointment>): void;
}
