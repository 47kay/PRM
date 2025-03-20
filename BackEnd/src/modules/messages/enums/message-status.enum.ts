// src/modules/messages/enums/message-status.enum.ts

/**
 * Enum representing the possible statuses of a message
 */
export enum MessageStatus {
    DRAFT = 'DRAFT',           // Message created but not sent
    QUEUED = 'QUEUED',         // Message queued for sending
    SENDING = 'SENDING',       // Message is in the process of being sent
    SENT = 'SENT',             // Message successfully sent
    DELIVERED = 'DELIVERED',   // Message delivered to recipient
    READ = 'READ',             // Message has been read by recipient
    FAILED = 'FAILED',         // Message failed to send
    CANCELLED = 'CANCELLED',   // Message was cancelled before sending
    SCHEDULED = 'SCHEDULED',   // Message scheduled for future delivery
  }