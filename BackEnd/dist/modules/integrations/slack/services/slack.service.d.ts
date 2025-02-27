import { ConfigService } from '@nestjs/config';
import { Block, KnownBlock, ChatPostMessageResponse, MessageAttachment } from '@slack/web-api';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class SlackService {
    private readonly configService;
    private readonly eventEmitter;
    sendDirectMessage(arg0: {
        userId: any;
        message: {
            text: string;
            blocks: {
                type: string;
                text: {
                    type: string;
                    text: string;
                };
            }[];
        };
    }): void;
    private readonly logger;
    private readonly client;
    constructor(configService: ConfigService, eventEmitter: EventEmitter2);
    sendMessage(channel: string, text: string, threadTs?: string): Promise<ChatPostMessageResponse>;
    sendBlockMessage(channel: string, blocks: (Block | KnownBlock)[], text?: string): Promise<ChatPostMessageResponse>;
    sendAttachmentMessage(channel: string, attachments: Omit<MessageAttachment, 'ts'>[] & {
        ts?: string;
    }[], text?: string): Promise<ChatPostMessageResponse>;
    updateMessage(channel: string, ts: string, text: string, blocks?: (Block | KnownBlock)[]): Promise<void>;
    deleteMessage(channel: string, ts: string): Promise<void>;
    getChannelInfo(channelId: string): Promise<import("@slack/web-api/dist/types/response/ConversationsInfoResponse").Channel | undefined>;
    joinChannel(channelId: string): Promise<void>;
    getChannelHistory(channel: string, limit?: number): Promise<import("@slack/web-api/dist/types/response/ConversationsHistoryResponse").MessageElement[] | undefined>;
}
