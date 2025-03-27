import { CallManagerService } from '../services/call-manager.service';
export declare class VoipController {
    private callManagerService;
    constructor(callManagerService: CallManagerService);
    placeCall(data: {
        destination: string;
        options?: any;
    }): Promise<{
        callId: string;
    }>;
    getCalls(query: any): Promise<void>;
    getCallDetails(id: string): Promise<void>;
}
