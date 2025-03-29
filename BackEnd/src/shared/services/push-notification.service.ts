import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { Notification } from '../../modules/notifications/entities/notification.entity';

@Injectable()
export class PushNotificationService {
    private readonly logger = new Logger(PushNotificationService.name);
    private firebaseApp: any;
    private mockMode = false;

    constructor(private readonly configService: ConfigService) {
        this.initializeFirebase();
    }

    private initializeFirebase() {
        try {
            // Check if Firebase credentials are available
            const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
            const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
            let privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

            // Check for mock configuration
            if (projectId === 'mock' || clientEmail === 'mock' || privateKey === 'mock') {
                this.logger.warn('Mock Firebase configuration detected - using mock implementation');
                this.initMockFirebase();
                this.mockMode = true;
                return;
            }

            // Check if credentials are present
            if (!projectId || !clientEmail || !privateKey) {
                this.logger.warn('Firebase credentials incomplete - using mock implementation');
                this.initMockFirebase();
                this.mockMode = true;
                return;
            }

            // Fix common PEM formatting issues
            if (privateKey) {
                // Replace escaped newlines with actual newlines if needed
                if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
                    privateKey = privateKey.replace(/\\n/g, '\n');
                }
                
                // Ensure proper PEM format
                if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
                    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}`;
                }
                if (!privateKey.endsWith('-----END PRIVATE KEY-----')) {
                    privateKey = `${privateKey}\n-----END PRIVATE KEY-----`;
                }
            }

            // Check if Firebase app is already initialized
            if (admin.apps.length) {
                this.firebaseApp = admin.apps[0]!;
                this.logger.log('Using existing Firebase Admin SDK instance');
            } else {
                // Initialize Firebase Admin SDK
                this.firebaseApp = admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                    databaseURL: this.configService.get<string>('FIREBASE_DATABASE_URL'),
                });
                this.logger.log('Firebase Admin SDK initialized successfully');
            }
        } catch (error) {
            this.logger.warn(`Failed to initialize Firebase: ${error.message}`);
            this.logger.warn('Using mock implementation instead');
            this.initMockFirebase();
            this.mockMode = true;
        }
    }

    private initMockFirebase() {
        // Create a mock Firebase messaging service
        this.firebaseApp = {
            messaging: () => ({
                send: async (message: any) => {
                    this.logger.log(`[MOCK] Sending push notification to ${message.token || 'unknown'}`);
                    this.logger.debug('[MOCK] Push notification payload:', {
                        title: message.notification?.title,
                        body: message.notification?.body
                    });
                    return `mock-message-id-${Date.now()}`;
                },
                sendAll: async (messages: any[]) => {
                    this.logger.log(`[MOCK] Sending batch of ${messages.length} push notifications`);
                    return {
                        successCount: messages.length,
                        failureCount: 0,
                        responses: messages.map(() => ({
                            success: true,
                            messageId: `mock-message-id-${Date.now()}`,
                            error: null
                        }))
                    };
                },
                subscribeToTopic: async (tokens: string[], topic: string) => {
                    this.logger.log(`[MOCK] Subscribing ${tokens.length} tokens to topic ${topic}`);
                    return { successCount: tokens.length, failureCount: 0, errors: [] };
                },
                unsubscribeFromTopic: async (tokens: string[], topic: string) => {
                    this.logger.log(`[MOCK] Unsubscribing ${tokens.length} tokens from topic ${topic}`);
                    return { successCount: tokens.length, failureCount: 0, errors: [] };
                }
            })
        };
    }

   


    async send(notification: Notification): Promise<void> {
        try {
            const { recipient, content, subject, metadata } = notification;

            // In mock mode, don't throw error if FCM token is missing
            if (!this.mockMode && !recipient.fcmToken) {
                throw new Error('Recipient FCM token not found');
            }

            const token = recipient.fcmToken || 'mock-token';
            const message: any = {
                notification: {
                    title: subject,
                    body: this.formatContent(content),
                },
                data: this.prepareData(metadata),
                token,
                android: this.getAndroidConfig(metadata),
                apns: this.getApnsConfig(metadata),
                webpush: this.getWebPushConfig(metadata),
            };

            const response = await this.firebaseApp.messaging().send(message);
            this.logger.debug(`Push notification sent: ${response}`);

        } catch (error) {
            this.logger.error('Failed to send push notification:', error);
            if (!this.mockMode) {
                throw new Error(`Push notification delivery failed: ${error.message}`);
            } else {
                this.logger.warn('[MOCK] Continuing despite push notification error');
            }
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

    private getAndroidConfig(metadata: any = {}): any {
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

    private getApnsConfig(metadata: any = {}): any {
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

    private getWebPushConfig(metadata: any = {}): any {
        return {
            notification: {
                icon: metadata?.webIcon,
                badge: metadata?.webBadge,
                actions: metadata?.webActions,
            },
            data: this.prepareData(metadata?.webData),
        };
    }

    async sendBatch(notifications: Notification[]): Promise<any> {
        try {
            const messages = notifications.map(notification => ({
                token: notification.recipient.fcmToken || 'mock-token',
                notification: {
                    title: notification.subject,
                    body: this.formatContent(notification.content),
                },
                data: this.prepareData(notification.metadata),
            }));

            return await this.firebaseApp.messaging().sendAll(messages);
        } catch (error) {
            this.logger.error('Failed to send batch push notifications:', error);
            if (!this.mockMode) {
                throw new Error(`Batch push notification delivery failed: ${error.message}`);
            } else {
                this.logger.warn('[MOCK] Continuing despite batch push notification error');
                return {
                    successCount: notifications.length,
                    failureCount: 0,
                    responses: []
                };
            }
        }
    }

    async subscribeTopic(tokens: string[], topic: string): Promise<void> {
        try {
            await this.firebaseApp.messaging().subscribeToTopic(tokens, topic);
            this.logger.log(`Subscribed ${tokens.length} tokens to topic ${topic}`);
        } catch (error) {
            this.logger.error(`Failed to subscribe tokens to topic ${topic}:`, error);
            if (!this.mockMode) {
                throw new Error(`Topic subscription failed: ${error.message}`);
            } else {
                this.logger.warn('[MOCK] Continuing despite topic subscription error');
            }
        }
    }

    async unsubscribeTopic(tokens: string[], topic: string): Promise<void> {
        try {
            await this.firebaseApp.messaging().unsubscribeFromTopic(tokens, topic);
            this.logger.log(`Unsubscribed ${tokens.length} tokens from topic ${topic}`);
        } catch (error) {
            this.logger.error(`Failed to unsubscribe tokens from topic ${topic}:`, error);
            if (!this.mockMode) {
                throw new Error(`Topic unsubscription failed: ${error.message}`);
            } else {
                this.logger.warn('[MOCK] Continuing despite topic unsubscription error');
            }
        }
    }
}