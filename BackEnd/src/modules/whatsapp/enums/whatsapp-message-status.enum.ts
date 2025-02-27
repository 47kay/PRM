export enum WhatsAppMessageStatus {
    // Initial states
    DRAFT = 'DRAFT',
    QUEUED = 'QUEUED',
    SCHEDULED = 'SCHEDULED',
    
    // Processing states
    PROCESSING = 'PROCESSING',
    RATE_LIMITED = 'RATE_LIMITED',
    RETRYING = 'RETRYING',
    
    // Delivery states
    SENT = 'SENT',
    DELIVERED = 'DELIVERED',
    READ = 'READ',
    REPLIED = 'REPLIED',
    
    // Error states
    FAILED = 'FAILED',
    REJECTED = 'REJECTED',
    INVALID = 'INVALID',
    EXPIRED = 'EXPIRED',
    
    // Terminal states
    CANCELLED = 'CANCELLED',
    DELETED = 'DELETED',
    PENDING = "PENDING",
    RECEIVED = "RECEIVED",
    PERMANENTLY_FAILED = "PERMANENTLY_FAILED",
    UNKNOWN = "UNKNOWN"
  }
  
  export const MessageStatusMetadata = {
    [WhatsAppMessageStatus.DRAFT]: {
      final: false,
      retryable: false,
      description: 'Message is saved as draft'
    },
    [WhatsAppMessageStatus.QUEUED]: {
      final: false,
      retryable: false,
      description: 'Message is queued for sending'
    },
    [WhatsAppMessageStatus.SCHEDULED]: {
      final: false,
      retryable: false,
      description: 'Message is scheduled for future delivery'
    },
    [WhatsAppMessageStatus.PROCESSING]: {
      final: false,
      retryable: true,
      description: 'Message is being processed for sending'
    },
    [WhatsAppMessageStatus.RATE_LIMITED]: {
      final: false,
      retryable: true,
      description: 'Message sending delayed due to rate limits'
    },
    [WhatsAppMessageStatus.RETRYING]: {
      final: false,
      retryable: true,
      description: 'Message is being retried after failure'
    },
    [WhatsAppMessageStatus.SENT]: {
      final: false,
      retryable: false,
      description: 'Message has been sent to WhatsApp'
    },
    [WhatsAppMessageStatus.DELIVERED]: {
      final: false,
      retryable: false,
      description: 'Message has been delivered to recipient'
    },
    [WhatsAppMessageStatus.READ]: {
      final: false,
      retryable: false,
      description: 'Message has been read by recipient'
    },
    [WhatsAppMessageStatus.REPLIED]: {
      final: true,
      retryable: false,
      description: 'Message has received a reply'
    },
    [WhatsAppMessageStatus.FAILED]: {
      final: false,
      retryable: true,
      description: 'Message sending failed'
    },
    [WhatsAppMessageStatus.REJECTED]: {
      final: true,
      retryable: false,
      description: 'Message was rejected by WhatsApp'
    },
    [WhatsAppMessageStatus.INVALID]: {
      final: true,
      retryable: false,
      description: 'Message content is invalid'
    },
    [WhatsAppMessageStatus.EXPIRED]: {
      final: true,
      retryable: false,
      description: 'Message has expired'
    },
    [WhatsAppMessageStatus.CANCELLED]: {
      final: true,
      retryable: false,
      description: 'Message was cancelled'
    },
    [WhatsAppMessageStatus.DELETED]: {
      final: true,
      retryable: false,
      description: 'Message was deleted'
    },
    [WhatsAppMessageStatus.PENDING]: {
      final: false,
      retryable: false,
      description: 'Message is pending'
    },
    [WhatsAppMessageStatus.RECEIVED]: {
      final: false,
      retryable: false,
      description: 'Message has been received'
    },
    [WhatsAppMessageStatus.PERMANENTLY_FAILED]: {
      final: true,
      retryable: false,
      description: 'Message has permanently failed'
    }
  };
  
  // Helper function to check if status is final
  export function isFinalStatus(status: WhatsAppMessageStatus): boolean {
    return MessageStatusMetadata[status].final;
  }
  
  // Helper function to check if status is retryable
  export function isRetryableStatus(status: WhatsAppMessageStatus): boolean {
    return MessageStatusMetadata[status].retryable;
  }
  
  // Helper function to get status description
  export function getStatusDescription(status: WhatsAppMessageStatus): string {
    return MessageStatusMetadata[status].description;
  }
  
  // Helper function to check if status can transition to another status
  export function canTransitionTo(
    currentStatus: WhatsAppMessageStatus,
    newStatus: WhatsAppMessageStatus
  ): boolean {
    // Terminal states cannot transition
    if (MessageStatusMetadata[currentStatus].final) {
      return false;
    }
  
    // Define valid transitions
    const validTransitions = new Map<WhatsAppMessageStatus, WhatsAppMessageStatus[]>([
      [WhatsAppMessageStatus.DRAFT, [
        WhatsAppMessageStatus.QUEUED,
        WhatsAppMessageStatus.SCHEDULED,
        WhatsAppMessageStatus.CANCELLED,
        WhatsAppMessageStatus.DELETED
      ]],
      [WhatsAppMessageStatus.QUEUED, [
        WhatsAppMessageStatus.PROCESSING,
        WhatsAppMessageStatus.RATE_LIMITED,
        WhatsAppMessageStatus.CANCELLED
      ]],
      [WhatsAppMessageStatus.SCHEDULED, [
        WhatsAppMessageStatus.QUEUED,
        WhatsAppMessageStatus.CANCELLED,
        WhatsAppMessageStatus.EXPIRED
      ]],
      [WhatsAppMessageStatus.PROCESSING, [
        WhatsAppMessageStatus.SENT,
        WhatsAppMessageStatus.FAILED,
        WhatsAppMessageStatus.REJECTED,
        WhatsAppMessageStatus.INVALID
      ]],
      [WhatsAppMessageStatus.RATE_LIMITED, [
        WhatsAppMessageStatus.QUEUED,
        WhatsAppMessageStatus.PROCESSING,
        WhatsAppMessageStatus.CANCELLED
      ]],
      [WhatsAppMessageStatus.RETRYING, [
        WhatsAppMessageStatus.PROCESSING,
        WhatsAppMessageStatus.FAILED,
        WhatsAppMessageStatus.CANCELLED
      ]],
      [WhatsAppMessageStatus.SENT, [
        WhatsAppMessageStatus.DELIVERED,
        WhatsAppMessageStatus.FAILED
      ]],
      [WhatsAppMessageStatus.DELIVERED, [
        WhatsAppMessageStatus.READ,
        WhatsAppMessageStatus.REPLIED
      ]],
      [WhatsAppMessageStatus.READ, [
        WhatsAppMessageStatus.REPLIED
      ]],
      [WhatsAppMessageStatus.FAILED, [
        WhatsAppMessageStatus.RETRYING,
        WhatsAppMessageStatus.CANCELLED
      ]]
    ]);
  
    const allowedTransitions = validTransitions.get(currentStatus) || [];
    return allowedTransitions.includes(newStatus);
  }