import { ConfigService } from '@nestjs/config';
interface UploadOptions {
    fileName: string;
    buffer: Buffer;
    mimeType?: string;
    organizationId: string;
    module: string;
    isPrivate?: boolean;
    metadata?: Record<string, string>;
}
interface GenerateUrlOptions {
    key: string;
    expiresIn?: number;
    responseContentDisposition?: string;
}
export declare class StorageService {
    private readonly configService;
    private readonly logger;
    private readonly bucketName;
    private readonly cdnDomain?;
    constructor(configService: ConfigService);
    upload(options: UploadOptions): Promise<{
        key: string;
        url: string;
        size: number;
        mimeType: string;
    }>;
    generateSignedUrl(options: GenerateUrlOptions): Promise<string>;
    private generatePublicUrl;
    delete(key: string): Promise<void>;
    private generateStorageKey;
    getMetadata(key: string): Promise<Record<string, string>>;
    copy(sourceKey: string, destinationKey: string): Promise<void>;
    move(sourceKey: string, destinationKey: string): Promise<void>;
    getModuleBucketLocation(module: string): string;
    private guessMimeType;
}
export {};
