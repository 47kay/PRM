import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebClient, Block, KnownBlock, ChatPostMessageResponse, MessageAttachment } from '@slack/web-api';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SlackService {
  sendDirectMessage(arg0: { userId: any; message: { text: string; blocks: { type: string; text: { type: string; text: string; }; }[]; }; }) {
      throw new Error('Method not implemented.');
  }
  private readonly logger = new Logger(SlackService.name);
  private readonly client: WebClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    const token = this.configService.get<string>('SLACK_BOT_TOKEN');
    this.client = new WebClient(token);
  }

  /**
   * Send a simple text message to a Slack channel
   */
  async sendMessage(
    channel: string,
    text: string,
    threadTs?: string,
  ): Promise<ChatPostMessageResponse> {
    try {
      const response = await this.client.chat.postMessage({
        channel,
        text,
        thread_ts: threadTs,
      });

      this.logger.log(`Slack message sent successfully to channel: ${channel}`);
      this.eventEmitter.emit('slack.message.sent', {
        channel,
        messageTs: response.ts,
        text,
      });

      return response;
    } catch (error) {
      this.logger.error('Failed to send Slack message', error);
      this.eventEmitter.emit('slack.message.failed', {
        channel,
        text,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Send a message with block components
   */
  async sendBlockMessage(
    channel: string,
    blocks: (Block | KnownBlock)[],
    text?: string,
  ): Promise<ChatPostMessageResponse> {
    try {
      const response = await this.client.chat.postMessage({
        channel,
        blocks,
        text: text || 'Message with block content', // Fallback text
      });

      this.logger.log(`Slack block message sent successfully to channel: ${channel}`);
      this.eventEmitter.emit('slack.message.sent', {
        channel,
        messageTs: response.ts,
        blocks,
      });

      return response;
    } catch (error) {
      this.logger.error('Failed to send Slack block message', error);
      this.eventEmitter.emit('slack.message.failed', {
        channel,
        blocks,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Send a message with attachments
   */
  async sendAttachmentMessage(
    channel: string,
    attachments: Omit<MessageAttachment, 'ts'>[] & { ts?: string }[],
    text?: string,
  ): Promise<ChatPostMessageResponse> {
    try {
      const response = await this.client.chat.postMessage({
        channel,
        text: text || 'Message with attachments', // Fallback text
        attachments,
      });

      this.logger.log(`Slack attachment message sent successfully to channel: ${channel}`);
      this.eventEmitter.emit('slack.message.sent', {
        channel,
        messageTs: response.ts,
        attachments,
      });

      return response;
    } catch (error) {
      this.logger.error('Failed to send Slack attachment message', error);
      this.eventEmitter.emit('slack.message.failed', {
        channel,
        attachments,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update an existing message
   */
  async updateMessage(
    channel: string,
    ts: string,
    text: string,
    blocks?: (Block | KnownBlock)[],
  ): Promise<void> {
    try {
      const updateParams = {
        channel,
        ts,
        text,
        ...(blocks && { blocks }),
      };

      await this.client.chat.update(updateParams);

      this.logger.log(`Slack message updated successfully in channel: ${channel}`);
      this.eventEmitter.emit('slack.message.updated', {
        channel,
        messageTs: ts,
        text,
        blocks,
      });
    } catch (error) {
      this.logger.error('Failed to update Slack message', error);
      this.eventEmitter.emit('slack.message.update.failed', {
        channel,
        ts,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(channel: string, ts: string): Promise<void> {
    try {
      await this.client.chat.delete({
        channel,
        ts,
      });

      this.logger.log(`Slack message deleted successfully from channel: ${channel}`);
      this.eventEmitter.emit('slack.message.deleted', {
        channel,
        messageTs: ts,
      });
    } catch (error) {
      this.logger.error('Failed to delete Slack message', error);
      this.eventEmitter.emit('slack.message.delete.failed', {
        channel,
        ts,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get channel information
   */
  async getChannelInfo(channelId: string) {
    try {
      const response = await this.client.conversations.info({
        channel: channelId,
      });
      return response.channel;
    } catch (error) {
      this.logger.error('Failed to get channel information', error);
      throw error;
    }
  }

  /**
   * Join a channel
   */
  async joinChannel(channelId: string) {
    try {
      await this.client.conversations.join({
        channel: channelId,
      });
      this.logger.log(`Successfully joined channel: ${channelId}`);
    } catch (error) {
      this.logger.error('Failed to join channel', error);
      throw error;
    }
  }

  /**
   * Get message history from a channel
   */
  async getChannelHistory(channel: string, limit = 100) {
    try {
      const response = await this.client.conversations.history({
        channel,
        limit,
      });
      return response.messages;
    } catch (error) {
      this.logger.error('Failed to get channel history', error);
      throw error;
    }
  }
}