import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
export declare class AppService {
    private readonly configService;
    private notificationsQueue;
    private messagesQueue;
    private redis;
    constructor(configService: ConfigService, notificationsQueue: Queue, messagesQueue: Queue);
    checkHealth(): Promise<{
        isHealthy: boolean;
        services: {
            database: {
                status: string;
                latency: number;
                error?: undefined;
            } | {
                status: string;
                error: any;
                latency?: undefined;
            };
            redis: {
                status: string;
                latency: number;
                error?: undefined;
            } | {
                status: string;
                error: any;
                latency?: undefined;
            };
            queues: {
                status: string;
                queues: {
                    notifications: {
                        status: string;
                        metrics: {
                            active: number;
                            waiting: number;
                            completed: number;
                            failed: number;
                        };
                        error?: undefined;
                    } | {
                        status: string;
                        error: any;
                        metrics?: undefined;
                    };
                    messages: {
                        status: string;
                        metrics: {
                            active: number;
                            waiting: number;
                            completed: number;
                            failed: number;
                        };
                        error?: undefined;
                    } | {
                        status: string;
                        error: any;
                        metrics?: undefined;
                    };
                };
                error?: undefined;
            } | {
                status: string;
                error: any;
                queues?: undefined;
            };
            memory: {
                status: string;
                metrics: {
                    heapUsed: string;
                    heapTotal: string;
                    rss: string;
                    external: string;
                };
                usage: string;
            };
        };
        timestamp: string;
    }>;
    private checkDatabase;
    private checkDatabaseQuery;
    private checkRedis;
    private checkQueues;
    private checkQueueHealth;
    private checkMemory;
    private formatBytes;
}
