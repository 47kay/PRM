import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as path from 'path';
import * as crypto from 'crypto';
import * as mime from 'mime-types';

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
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly cdnDomain?: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET') || 'default-bucket-name';
    this.cdnDomain = this.configService.get<string>('CDN_DOMAIN');

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error('AWS S3 configuration is incomplete');
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: accessKeyId as string,
        secretAccessKey: secretAccessKey as string,
      },
    });
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

    // Determine MIME type
    const mimeType = providedMimeType || mime.lookup(fileName) || 'application/octet-stream';

    try {
      // Upload to S3
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          Metadata: {
            ...metadata,
            fileName,
            organizationId,
            module,
            isPrivate: String(isPrivate),
          },
        })
      );

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
    } catch (error) {
      this.logger.error(`Error uploading file ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Generate signed URL for private files
   */
  async generateSignedUrl(options: GenerateUrlOptions): Promise<string> {
    const { key, expiresIn = 3600 } = options;

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ResponseContentDisposition: options.responseContentDisposition,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
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
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );
    } catch (error) {
      this.logger.error(`Error deleting file ${key}:`, error);
      throw error;
    }
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
    try {
      const { Metadata } = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );
      return Metadata || {};
    } catch (error) {
      this.logger.error(`Error getting metadata for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Copy file within storage
   */
  async copy(
    sourceKey: string,
    destinationKey: string
  ): Promise<void> {
    try {
      await this.s3Client.send(
        new CopyObjectCommand({
          Bucket: this.bucketName,
          Key: destinationKey,
          CopySource: `${this.bucketName}/${sourceKey}`,
        })
      );
    } catch (error) {
      this.logger.error(
        `Error copying file from ${sourceKey} to ${destinationKey}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Move file within storage
   */
  async move(
    sourceKey: string,
    destinationKey: string
  ): Promise<void> {
    await this.copy(sourceKey, destinationKey);
    await this.delete(sourceKey);
  }

  /**
   * Get bucket location for a module
   */
  getModuleBucketLocation(module: string): string {
    return `${this.bucketName}/${module}`;
  }
}