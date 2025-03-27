// src/modules/integrations/slack/services/slack.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Mock WebClient and types
type Block = any;
type KnownBlock = any;
type ChatPostMessageResponse = { ts: string; ok: boolean };
type MessageAttachment = any;

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private readonly client: any;

  constructor(
      private readonly configService: ConfigService,
      private readonly eventEmitter: EventEmitter2,
  ) {
    const token = this.configService.get<string>('SLACK_BOT_TOKEN');
    // Mock client
    this.client = {
      chat: {
        postMessage: async () => ({ ok: true, ts: String(Date.now()) }),
        update: async () => ({ ok: true }),
        delete: async () => ({ ok: true }),
      },
      conversations: {
        info: async () => ({ channel: { id: 'mock-channel', name: 'mock-channel-name' } }),
        join: async () => ({ ok: true }),
        history: async () => ({ messages: [] }),
      }
    };
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
      this.logger.log(`[MOCK] Sending Slack message to channel ${channel}: ${text}`);

      const response = { ok: true, ts: String(Date.now()) };

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

  sendDirectMessage(arg0: { userId: any; message: { text: string; blocks: { type: string; text: { type: string; text: string; }; }[]; }; }) {
    this.logger.log(`[MOCK] Sending direct message to user ${arg0.userId}: ${arg0.message.text}`);
    return Promise.resolve({ ok: true, ts: String(Date.now()) });
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
      this.logger.log(`[MOCK] Sending Slack block message to channel ${channel}`);

      const response = { ok: true, ts: String(Date.now()) };

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
      attachments: any[],
      text?: string,
  ): Promise<ChatPostMessageResponse> {
    try {
      this.logger.log(`[MOCK] Sending Slack attachment message to channel ${channel}`);

      const response = { ok: true, ts: String(Date.now()) };

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
      blocks?: any[],
  ): Promise<void> {
    try {
      this.logger.log(`[MOCK] Updating Slack message in channel ${channel}, ts: ${ts}, text: ${text}`);

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
      this.logger.log(`[MOCK] Deleting Slack message from channel ${channel}, ts: ${ts}`);

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
    this.logger.log(`[MOCK] Getting info for channel ${channelId}`);
    return { id: channelId, name: `mock-channel-${channelId}` };
  }

  /**
   * Join a channel
   */
  async joinChannel(channelId: string) {
    this.logger.log(`[MOCK] Joining channel ${channelId}`);
    return { ok: true };
  }

  /**
   * Get message history from a channel
   */
  async getChannelHistory(channel: string, limit = 100) {
    this.logger.log(`[MOCK] Getting history for channel ${channel}, limit: ${limit}`);
    return Array(Math.min(limit, 10)).fill(null).map((_, i) => ({
      ts: String(Date.now() - i * 60000),
      text: `Mock message ${i+1}`,
      user: `U${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    }));
  }
}