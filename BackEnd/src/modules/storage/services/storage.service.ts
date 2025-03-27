import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as crypto from 'crypto';
// import * as mime from 'mime-types'; // Comment out dependency

// Mock interface definitions
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
  expiresIn?: number; // seconds
  responseContentDisposition?: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucketName: string;
  private readonly cdnDomain?: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET') || 'default-bucket-name';
    this.cdnDomain = this.configService.get<string>('CDN_DOMAIN');
  }

  /**
   * Upload file to storage
   */
  async upload(options: UploadOptions): Promise<{
    key: string;
    url: string;
    size: number;
    mimeType: string;
  }> {
    const {
      fileName,
      buffer,
      mimeType: providedMimeType,
      organizationId,
      module,
      isPrivate = false,
      metadata = {},
    } = options;

    // Generate a unique key for the file
    const key = this.generateStorageKey({
      fileName,
      organizationId,
      module,
    });

    // Determine MIME type - use provided or guess from extension
    const mimeType = providedMimeType || this.guessMimeType(fileName);

    this.logger.log(`[MOCK] Uploading file ${fileName} to ${key}`);

    // Generate URL
    const url = isPrivate
        ? await this.generateSignedUrl({ key })
        : this.generatePublicUrl(key);

    return {
      key,
      url,
      size: buffer.length,
      mimeType,
    };
  }

  /**
   * Generate signed URL for private files
   */
  async generateSignedUrl(options: GenerateUrlOptions): Promise<string> {
    const { key, expiresIn = 3600 } = options;
    this.logger.log(`[MOCK] Generating signed URL for ${key}`);

    // Generate a mock signed URL
    const expires = Date.now() + (expiresIn * 1000);
    return `https://${this.bucketName}.s3.amazonaws.com/${key}?mock-signature=xxx&expires=${expires}`;
  }

  /**
   * Generate public URL for non-private files
   */
  private generatePublicUrl(key: string): string {
    if (this.cdnDomain) {
      return `https://${this.cdnDomain}/${key}`;
    }
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }

  /**
   * Delete file from storage
   */
  async delete(key: string): Promise<void> {
    this.logger.log(`[MOCK] Deleting file ${key}`);
  }

  /**
   * Generate storage key for file
   */
  private generateStorageKey(options: {
    fileName: string;
    organizationId: string;
    module: string;
  }): string {
    const { fileName, organizationId, module } = options;
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(fileName);
    const sanitizedName = path.basename(fileName, extension)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');

    return `${organizationId}/${module}/${timestamp}-${random}-${sanitizedName}${extension}`;
  }

  /**
   * Get file metadata
   */
  async getMetadata(key: string): Promise<Record<string, string>> {
    this.logger.log(`[MOCK] Getting metadata for ${key}`);
    return {
      fileName: path.basename(key),
      contentType: this.guessMimeType(key),
      size: '1024',
      uploadedAt: new Date().toISOString(),
    };
  }

  /**
   * Copy file within storage
   */
  async copy(
      sourceKey: string,
      destinationKey: string
  ): Promise<void> {
    this.logger.log(`[MOCK] Copying file from ${sourceKey} to ${destinationKey}`);
  }

  /**
   * Move file within storage
   */
  async move(
      sourceKey: string,
      destinationKey: string
  ): Promise<void> {
    this.logger.log(`[MOCK] Moving file from ${sourceKey} to ${destinationKey}`);
  }

  /**
   * Get bucket location for a module
   */
  getModuleBucketLocation(module: string): string {
    return `${this.bucketName}/${module}`;
  }

  /**
   * Helper to guess MIME type from filename
   */
  private guessMimeType(fileName: string): string {
    const extension = path.extname(fileName).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.zip': 'application/zip',
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }
}