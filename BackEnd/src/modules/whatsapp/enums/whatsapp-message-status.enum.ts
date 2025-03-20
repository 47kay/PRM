// src/modules/whatsapp/enums/whatsapp-message-status.enum.ts

export enum WhatsAppMessageStatus {
  DRAFT = 'DRAFT',
  QUEUED = 'QUEUED',
  SCHEDULED = 'SCHEDULED',
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
  BLOCKED = 'BLOCKED',
  EXPIRED = 'EXPIRED',
  DELETED = 'DELETED',
  UNDELIVERABLE = 'UNDELIVERABLE',
  UNKNOWN = 'UNKNOWN',
  PERMANENTLY_FAILED = 'PERMANENTLY_FAILED',
  RECEIVED = 'RECEIVED',
}

// Define a type for status properties
interface StatusProperties {
  final: boolean;
  retryable: boolean;
  description: string;
}

// Create a record type that maps all enum values to their properties
export const MESSAGE_STATUS_PROPERTIES: Record<WhatsAppMessageStatus, StatusProperties> = {
  [WhatsAppMessageStatus.DRAFT]: {
    final: false,
    retryable: true,
    description: 'Message is drafted but not yet queued for sending',
  },
  [WhatsAppMessageStatus.QUEUED]: {
    final: false,
    retryable: true,
    description: 'Message is queued for sending',
  },
  [WhatsAppMessageStatus.SCHEDULED]: {
    final: false,
    retryable: true,
    description: 'Message is scheduled to be sent at a later time',
  },
  [WhatsAppMessageStatus.PENDING]: {
    final: false,
    retryable: true,
    description: 'Message is being processed for sending',
  },
  [WhatsAppMessageStatus.SENT]: {
    final: false,
    retryable: false,
    description: 'Message has been sent to WhatsApp servers',
  },
  [WhatsAppMessageStatus.DELIVERED]: {
    final: false,
    retryable: false,
    description: 'Message has been delivered to the recipient',
  },
  [WhatsAppMessageStatus.READ]: {
    final: true,
    retryable: false,
    description: 'Message has been read by the recipient',
  },
  [WhatsAppMessageStatus.FAILED]: {
    final: false,
    retryable: true,
    description: 'Message failed to send but can be retried',
  },
  [WhatsAppMessageStatus.CANCELED]: {
    final: true,
    retryable: false,
    description: 'Message was canceled before it could be sent',
  },
  [WhatsAppMessageStatus.BLOCKED]: {
    final: true,
    retryable: false,
    description: 'Message was blocked by WhatsApp',
  },
  [WhatsAppMessageStatus.EXPIRED]: {
    final: true,
    retryable: false,
    description: 'Message expired before it could be delivered',
  },
  [WhatsAppMessageStatus.DELETED]: {
    final: true,
    retryable: false,
    description: 'Message was deleted',
  },
  [WhatsAppMessageStatus.UNDELIVERABLE]: {
    final: true,
    retryable: false,
    description: 'Message cannot be delivered to the recipient',
  },
  [WhatsAppMessageStatus.UNKNOWN]: {
    final: false,
    retryable: false,
    description: 'Message status is unknown',
  },
  [WhatsAppMessageStatus.PERMANENTLY_FAILED]: {
    final: true,
    retryable: false,
    description: 'Message has permanently failed to send after max retries',
  },
  [WhatsAppMessageStatus.RECEIVED]: {
    final: false,
    retryable: false,
    description: 'Message has been received from a user',
  },
};