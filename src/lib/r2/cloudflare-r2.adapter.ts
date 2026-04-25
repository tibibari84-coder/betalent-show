import 'server-only';

import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@/lib/env';
import { buildR2AssetUrl } from './url';
import {
  R2AbortMultipartUploadOptions,
  R2CompleteMultipartUploadOptions,
  R2MultipartUploadOptions,
  R2MultipartUploadPartUrlOptions,
  R2MultipartUploadPartUrlResult,
  R2MultipartUploadResult,
  R2SignedUploadUrlOptions,
  R2SignedUploadUrlResult,
  R2StorageAdapter,
} from './types';

export class CloudflareR2Adapter implements R2StorageAdapter {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID!,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  async getSignedUploadUrl({ key, contentType, expiresInSeconds = 3600 }: R2SignedUploadUrlOptions): Promise<R2SignedUploadUrlResult> {
    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
    });

    const assetUrl = buildR2AssetUrl(key);

    return { uploadUrl, assetUrl, key };
  }

  async createMultipartUpload({ key, contentType }: R2MultipartUploadOptions): Promise<R2MultipartUploadResult> {
    const response = await this.client.send(
      new CreateMultipartUploadCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      }),
    );

    if (!response.UploadId) {
      throw new Error('R2 did not return a multipart upload id.');
    }

    return {
      uploadId: response.UploadId,
      assetUrl: buildR2AssetUrl(key),
      key,
    };
  }

  async getSignedMultipartUploadPartUrl({
    key,
    uploadId,
    partNumber,
    expiresInSeconds = 3600,
  }: R2MultipartUploadPartUrlOptions): Promise<R2MultipartUploadPartUrlResult> {
    const command = new UploadPartCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    return {
      uploadUrl: await getSignedUrl(this.client, command, {
        expiresIn: expiresInSeconds,
      }),
      partNumber,
    };
  }

  async completeMultipartUpload({ key, uploadId, parts }: R2CompleteMultipartUploadOptions): Promise<void> {
    await this.client.send(
      new CompleteMultipartUploadCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts
            .slice()
            .sort((a, b) => a.partNumber - b.partNumber)
            .map((part) => ({
              ETag: part.etag,
              PartNumber: part.partNumber,
            })),
        },
      }),
    );
  }

  async abortMultipartUpload({ key, uploadId }: R2AbortMultipartUploadOptions): Promise<void> {
    await this.client.send(
      new AbortMultipartUploadCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
      }),
    );
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
      }),
    );
  }
}
