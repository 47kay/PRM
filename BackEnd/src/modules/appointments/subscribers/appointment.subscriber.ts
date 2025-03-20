// src/modules/appointments/subscribers/appointment.subscriber.ts

import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
    RemoveEvent,
    Connection,
  } from 'typeorm';
  import { Injectable } from '@nestjs/common';
  import { InjectConnection } from '@nestjs/typeorm';
  import { EventEmitter2 } from '@nestjs/event-emitter';
  import { Appointment } from '../entities/appointment.entity';
  import { AppointmentEventTypes } from '../appointments.module';
  
  @Injectable()
  @EventSubscriber()
  export class AppointmentSubscriber implements EntitySubscriberInterface<Appointment> {
    constructor(
      @InjectConnection() connection: Connection,
      private eventEmitter: EventEmitter2,
    ) {
      // Register this subscriber with the connection
      connection.subscribers.push(this);
    }
  
    // Specify the entity type this subscriber listens to
    listenTo() {
      return Appointment;
    }
  
    // Handle appointment creation events
    afterInsert(event: InsertEvent<Appointment>): void {
      const appointment = event.entity;
      if (appointment) {
        this.eventEmitter.emit(AppointmentEventTypes.CREATED, {
          appointment,
          timestamp: new Date(),
        });
      }
    }
  
    // Handle appointment update events
    afterUpdate(event: UpdateEvent<Appointment>): void {
      const appointment = event.entity;
      if (!appointment) return;
  
      // Get the old and new values
      const oldStatus = event.databaseEntity?.status;
      const newStatus = appointment.status;
  
      // Determine what type of update occurred
      if (oldStatus !== newStatus) {
        switch (newStatus) {
          case 'cancelled':
            this.eventEmitter.emit(AppointmentEventTypes.CANCELLED, {
              appointment,
              previousStatus: oldStatus,
              timestamp: new Date(),
            });
            break;
          case 'completed':
            this.eventEmitter.emit(AppointmentEventTypes.COMPLETED, {
              appointment,
              previousStatus: oldStatus,
              timestamp: new Date(),
            });
            break;
          default:
            // For general updates and reschedules
            const oldDate = event.databaseEntity?.scheduledFor;
            const newDate = appointment.scheduledFor;
            
            if (oldDate && newDate && oldDate.getTime() !== newDate.getTime()) {
              this.eventEmitter.emit(AppointmentEventTypes.RESCHEDULED, {
                appointment,
                previousDate: oldDate,
                timestamp: new Date(),
              });
            } else {
              this.eventEmitter.emit(AppointmentEventTypes.UPDATED, {
                appointment,
                timestamp: new Date(),
              });
            }
        }
      } else {
        // General update event
        this.eventEmitter.emit(AppointmentEventTypes.UPDATED, {
          appointment,
          timestamp: new Date(),
        });
      }
    }
  
    // Handle appointment removal events (soft delete)
    afterSoftRemove(event: RemoveEvent<Appointment>): void {
      const appointment = event.entity;
      if (appointment) {
        this.eventEmitter.emit(AppointmentEventTypes.CANCELLED, {
          appointment,
          timestamp: new Date(),
          reason: 'deleted',
        });
      }
    }
  }