export declare class DratchioClient {
    constructor(config: any);
    on(event: string, callback: Function): this;
    register(): Promise<void>;
    call(options: any): Promise<{
        uuid: string;
        answer: () => void;
        hangup: () => void;
    }>;
}
