export interface NotificationData {
    [key: string]: any;
}
export interface SendNotificationOptions {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: NotificationData;
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    icon?: string;
    link?: string;
    category?: string;
    organizationId?: string;
    expiresAt?: Date;
}
