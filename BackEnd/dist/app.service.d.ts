import { ConfigService } from '@nestjs/config';
export declare class AppService {
    private readonly configService;
    private redis;
    constructor(configService: ConfigService);
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
                    };
                    messages: {
                        status: string;
                        metrics: {
                            active: number;
                            waiting: number;
                            completed: number;
                            failed: number;
                        };
                    };
                };
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
    private checkQueuesMock;
    private checkMemory;
    private formatBytes;
}
