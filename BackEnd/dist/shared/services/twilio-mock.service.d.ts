import { ConfigService } from '@nestjs/config';
export declare class TwilioMockService {
    private configService;
    private readonly logger;
    private readonly mockClient;
    constructor(configService: ConfigService);
    getClient(): any;
}
