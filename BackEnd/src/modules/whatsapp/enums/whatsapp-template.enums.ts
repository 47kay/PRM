// src/modules/whatsapp/enums/whatsapp-template.enums.ts

/**
 * Whatsapp template status enum
 */
export enum WhatsappTemplateStatus {
    DRAFT = 'draft',
    PENDING_APPROVAL = 'pending_approval',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted'
  }
  
  /**
   * Whatsapp template category enum
   */
  export enum WhatsappTemplateCategory {
    ACCOUNT_UPDATE = 'account_update',
    PAYMENT_UPDATE = 'payment_update',
    PERSONAL_FINANCE_UPDATE = 'personal_finance_update',
    SHIPPING_UPDATE = 'shipping_update',
    RESERVATION_UPDATE = 'reservation_update',
    ISSUE_RESOLUTION = 'issue_resolution',
    APPOINTMENT_UPDATE = 'appointment_update',
    TRANSPORTATION_UPDATE = 'transportation_update',
    TICKET_UPDATE = 'ticket_update',
    ALERT_UPDATE = 'alert_update',
    AUTO_REPLY = 'auto_reply',
    TRANSACTIONAL = 'transactional',
    MARKETING = 'marketing',
    UTILITY = 'utility',
    AUTHENTICATION = 'authentication'
  }
  
  /**
   * Whatsapp template component type enum
   */
  export enum WhatsappTemplateComponentType {
    HEADER = 'header',
    BODY = 'body',
    FOOTER = 'footer',
    BUTTONS = 'buttons'
  }
  
  /**
   * Whatsapp template header type enum
   */
  export enum WhatsappTemplateHeaderType {
    TEXT = 'text',
    IMAGE = 'image',
    VIDEO = 'video',
    DOCUMENT = 'document',
    LOCATION = 'location'
  }
  
  /**
   * Whatsapp template button type enum
   */
  export enum WhatsappTemplateButtonType {
    PHONE_NUMBER = 'phone_number',
    URL = 'url',
    QUICK_REPLY = 'quick_reply'
  }