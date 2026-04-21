import 'server-only';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@/lib/env';
import { R2SignedUploadUrlOptions, R2SignedUploadUrlResult, R2StorageAdapter } from './types';

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

    const encodedKey = key.split('/').map(encodeURIComponent).join('/');
    const assetUrl = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/${encodedKey}`;

    return { uploadUrl, assetUrl, key };
  }
}
