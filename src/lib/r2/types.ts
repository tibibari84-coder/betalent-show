export type R2AssetPurpose = 'avatar' | 'profile' | 'static' | 'document' | 'export';

export interface R2SignedUploadUrlOptions {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}

export interface R2SignedUploadUrlResult {
  uploadUrl: string;
  assetUrl: string;
  key: string;
}

export interface R2StorageAdapter {
  getSignedUploadUrl(options: R2SignedUploadUrlOptions): Promise<R2SignedUploadUrlResult>;
}
