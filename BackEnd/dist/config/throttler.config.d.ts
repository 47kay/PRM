import { ConfigService } from '@nestjs/config';
import { ThrottlerModuleOptions, ThrottlerOptionsFactory } from '@nestjs/throttler';
export declare class ThrottlerConfigService implements ThrottlerOptionsFactory {
    private configService;
    constructor(configService: ConfigService);
    createThrottlerOptions(): ThrottlerModuleOptions;
}
