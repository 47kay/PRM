import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { Notification } from '../../modules/notifications/entities/notification.entity';

@Injectable()
export class PushNotificationService {
    private readonly logger = new Logger(PushNotificationService.name);
    private readonly firebaseApp: admin.app.App;

    constructor(private readonly configService: ConfigService) {
        // Initialize Firebase Admin SDK if not already initialized
        if (!admin.apps.length) {
            this.firebaseApp = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
                    clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
                    privateKey: (this.configService.get<string>('FIREBASE_PRIVATE_KEY') || '').replace(/\\n/g, '\n'),
                }),
                databaseURL: this.configService.get<string>('FIREBASE_DATABASE_URL'),
            });
        } else {
            this.firebaseApp = admin.apps[0]!;
        }
    }

    async send(notification: Notification): Promise<void> {
        try {
            const { recipient, content, subject, metadata } = notification;

            // Ensure recipient has FCM token
            if (!recipient.fcmToken) {
                throw new Error('Recipient FCM token not found');
            }

            const message: admin.messaging.Message = {
                notification: {
                    title: subject,
                    body: this.formatContent(content),
                },
                data: this.prepareData(metadata),
                token: recipient.fcmToken,
                android: this.getAndroidConfig(metadata),
                apns: this.getApnsConfig(metadata),
                webpush: this.getWebPushConfig(metadata),
            };

            const response = await this.firebaseApp.messaging().send(message);
            this.logger.debug(`Push notification sent: ${response}`);

        } catch (error) {
            this.logger.error('Failed to send push notification:', error);
            throw new Error(`Push notification delivery failed: ${error.message}`);
        }
    }

    private formatContent(content: string): string {
        // Remove HTML tags and truncate if necessary
        return content.replace(/<[^>]*>/g, '').substring(0, 1000);
    }

    private prepareData(metadata: any = {}): { [key: string]: string } {
        // Convert metadata to string key-value pairs for FCM data payload
        const data: { [key: string]: string } = {};
        
        Object.entries(metadata || {}).forEach(([key, value]) => {
            if (typeof value !== 'undefined' && value !== null) {
                data[key] = String(value);
            }
        });

        return data;
    }

    private getAndroidConfig(metadata: any = {}): admin.messaging.AndroidConfig {
        return {
            priority: 'high',
            notification: {
                icon: metadata?.androidIcon || 'default_icon',
                color: metadata?.androidColor || '#000000',
                clickAction: metadata?.androidClickAction || 'FLUTTER_NOTIFICATION_CLICK',
            },
            data: this.prepareData(metadata?.androidData),
        };
    }

    private getApnsConfig(metadata: any = {}): admin.messaging.ApnsConfig {
        return {
            payload: {
                aps: {
                    alert: {
                        title: metadata?.apnsTitle,
                        body: metadata?.apnsBody,
                    },
                    badge: metadata?.apnsBadge || 1,
                    sound: metadata?.apnsSound || 'default',
                },
                // Custom data for iOS
                ...this.prepareData(metadata?.apnsData),
            },
        };
    }

    private getWebPushConfig(metadata: any = {}): admin.messaging.WebpushConfig {
        return {
            notification: {
                icon: metadata?.webIcon,
                badge: metadata?.webBadge,
                actions: metadata?.webActions,
            },
            data: this.prepareData(metadata?.webData),
        };
    }

    async sendBatch(notifications: Notification[]): Promise<admin.messaging.BatchResponse> {
        try {
            const messages = notifications.map(notification => ({
                token: notification.recipient.fcmToken,
                notification: {
                    title: notification.subject,
                    body: this.formatContent(notification.content),
                },
                data: this.prepareData(notification.metadata),
            }));

            return await this.firebaseApp.messaging().sendAll(messages);
        } catch (error) {
            this.logger.error('Failed to send batch push notifications:', error);
            throw new Error(`Batch push notification delivery failed: ${error.message}`);
        }
    }

    async subscribeTopic(tokens: string[], topic: string): Promise<void> {
        try {
            await this.firebaseApp.messaging().subscribeToTopic(tokens, topic);
        } catch (error) {
            this.logger.error(`Failed to subscribe tokens to topic ${topic}:`, error);
            throw new Error(`Topic subscription failed: ${error.message}`);
        }
    }

    async unsubscribeTopic(tokens: string[], topic: string): Promise<void> {
        try {
            await this.firebaseApp.messaging().unsubscribeFromTopic(tokens, topic);
        } catch (error) {
            this.logger.error(`Failed to unsubscribe tokens from topic ${topic}:`, error);
            throw new Error(`Topic unsubscription failed: ${error.message}`);
        }
    }
}