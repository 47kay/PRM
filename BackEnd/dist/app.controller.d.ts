import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getInfo(): {
        name: string;
        version: string;
        environment: string;
        timestamp: string;
    };
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
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
        uptime: number;
        memory: NodeJS.MemoryUsage;
    }>;
    ping(): {
        message: string;
        timestamp: string;
    };
}
