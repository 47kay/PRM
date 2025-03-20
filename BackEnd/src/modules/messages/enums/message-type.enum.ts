// src/modules/messages/enums/message-type.enum.ts

/**
 * Enum representing the different types of messages
 */
export enum MessageType {
    EMAIL = 'EMAIL',           // Email message
    SMS = 'SMS',               // SMS text message
    PUSH = 'PUSH',             // Push notification
    IN_APP = 'IN_APP',         // In-app notification
    VOICE = 'VOICE',           // Voice/call message
    WHATSAPP = 'WHATSAPP',     // WhatsApp message
    TELEGRAM = 'TELEGRAM',     // Telegram message
    INTERNAL = 'INTERNAL',     // Internal system message
  }