export type R2AssetPurpose = 'avatar' | 'profile' | 'static' | 'document' | 'export' | 'video';

export interface R2SignedUploadUrlOptions {
  key: string;
  contentType: string;
  purpose: R2AssetPurpose;
  expiresInSeconds?: number;
}

export interface R2SignedUploadUrlResult {
  uploadUrl: string;
  assetUrl: string;
  key: string;
}

export interface R2MultipartUploadOptions {
  key: string;
  contentType: string;
  purpose: R2AssetPurpose;
}

export interface R2MultipartUploadResult {
  uploadId: string;
  assetUrl: string;
  key: string;
}

export interface R2MultipartUploadPartUrlOptions {
  key: string;
  uploadId: string;
  partNumber: number;
  expiresInSeconds?: number;
}

export interface R2MultipartUploadPartUrlResult {
  uploadUrl: string;
  partNumber: number;
}

export interface R2CompletedPart {
  partNumber: number;
  etag: string;
}

export interface R2CompleteMultipartUploadOptions {
  key: string;
  uploadId: string;
  parts: R2CompletedPart[];
}

export interface R2AbortMultipartUploadOptions {
  key: string;
  uploadId: string;
}

export interface R2StorageAdapter {
  getSignedUploadUrl(options: R2SignedUploadUrlOptions): Promise<R2SignedUploadUrlResult>;
  createMultipartUpload(options: R2MultipartUploadOptions): Promise<R2MultipartUploadResult>;
  getSignedMultipartUploadPartUrl(
    options: R2MultipartUploadPartUrlOptions,
  ): Promise<R2MultipartUploadPartUrlResult>;
  completeMultipartUpload(options: R2CompleteMultipartUploadOptions): Promise<void>;
  abortMultipartUpload(options: R2AbortMultipartUploadOptions): Promise<void>;
  deleteObject(key: string): Promise<void>;
}
