import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwilioMockService {
  private readonly logger = new Logger(TwilioMockService.name);
  private readonly mockClient: any;

  constructor(private configService: ConfigService) {
    this.logger.log('Initializing mock Twilio client');
    
    // Create a mock client that provides the expected methods/properties
    this.mockClient = {
      messages: {
        create: async (params: any) => {
          this.logger.log(`[MOCK] Sending SMS to ${params.to}: ${params.body}`);
          return {
            sid: `MOCK_${Date.now()}`,
            status: 'queued',
            dateCreated: new Date(),
          };
        },
      },
      calls: {
        create: async (params: any) => {
          this.logger.log(`[MOCK] Initiating call to ${params.to} from ${params.from}`);
          return {
            sid: `MOCK_CALL_${Date.now()}`,
            status: 'queued',
            dateCreated: new Date(),
          };
        },
      },
    };
  }

  // Method to get the mock client
  getClient() {
    return this.mockClient;
  }
}