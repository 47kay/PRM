// src/modules/messages/services/message-scheduler.service.ts

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Message } from '../entities/message.entity';
import { MessageStatus } from '../dto/create-message.dto';

@Injectable()
export class MessageSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MessageSchedulerService.name);
  private schedulerInterval: NodeJS.Timeout;

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Initialize the scheduler when the module starts
   */
  async onModuleInit() {
    this.logger.log('Message scheduler service initialized');
    try {
      // Process any messages that might have been scheduled
      // but not processed due to server restart
      await this.processScheduledMessages();
    } catch (error) {
      this.logger.error('Error processing scheduled messages:', error);
    }
  }

  /**
   * Clean up when the module is destroyed
   */
  onModuleDestroy() {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
    }
  }

  /**
   * Schedule a new message for future delivery
   */
  async scheduleMessage(message: Message, scheduledFor: Date): Promise<Message> {
    message.scheduledFor = scheduledFor;
    message.status = MessageStatus.SCHEDULED;
    
    return this.messageRepository.save(message);
  }

  /**
   * Cancel a scheduled message
   */
  async cancelScheduledMessage(messageId: string): Promise<void> {
    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    
    if (!message) {
      throw new Error(`Message with ID ${messageId} not found`);
    }
    
    if (message.status !== MessageStatus.SCHEDULED) {
      throw new Error(`Message is not scheduled: ${messageId}`);
    }
    
    message.status = MessageStatus.SENDING;
    message.scheduledFor = undefined;
    await this.messageRepository.save(message);
    
    this.logger.log(`Scheduled message ${messageId} has been canceled`);
  }

  /**
   * Reschedule a message for a different time
   */
  async rescheduleMessage(messageId: string, newScheduledFor: Date): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    
    if (!message) {
      throw new Error(`Message with ID ${messageId} not found`);
    }
    
    message.scheduledFor = newScheduledFor;
    message.status = MessageStatus.SCHEDULED;
    
    const updatedMessage = await this.messageRepository.save(message);
    this.logger.log(`Message ${messageId} rescheduled for ${newScheduledFor}`);
    
    return updatedMessage;
  }

  /**
   * Run every minute to check for messages that need to be sent
   * Uses NestJS built-in scheduler (requires @nestjs/schedule package)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledMessages() {
    try {
      this.logger.debug('Checking for scheduled messages...');
      
      // Find all scheduled messages that are due
      const now = new Date();
      const dueSendMessages = await this.messageRepository.find({
        where: {
          status: MessageStatus.SCHEDULED,
          scheduledFor: LessThanOrEqual(now),
        },
      });
      
      // If no messages are due, return early
      if (dueSendMessages.length === 0) {
        return;
      }
      
      this.logger.log(`Found ${dueSendMessages.length} scheduled messages to process`);
      
      // Update status to pending for all due messages
      await Promise.all(
        dueSendMessages.map(async (message) => {
          message.status = MessageStatus.SENDING;
          await this.messageRepository.save(message);
          
          // Emit event to trigger message processing
          this.eventEmitter.emit('message.created', message);
        })
      );
    } catch (error) {
      this.logger.error('Error processing scheduled messages:', error);
    }
  }

  /**
   * Get all scheduled messages
   */
  async getAllScheduledMessages() {
    return this.messageRepository.find({
      where: { status: MessageStatus.SCHEDULED },
      order: { scheduledFor: 'ASC' },
    });
  }

  /**
   * Get scheduled messages for a specific time period
   */
  async getScheduledMessagesForPeriod(startDate: Date, endDate: Date) {
    return this.messageRepository.find({
      where: {
        status: MessageStatus.SCHEDULED,
        scheduledFor: Between(startDate, endDate),
      },
      order: { scheduledFor: 'ASC' },
    });
  }
}