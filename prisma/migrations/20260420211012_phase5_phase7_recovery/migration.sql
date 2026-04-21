CREATE TYPE "VideoAssetProvider" AS ENUM ('CLOUDFLARE_STREAM');

ALTER TABLE "VideoAsset"
  ADD COLUMN "provider" "VideoAssetProvider" NOT NULL DEFAULT 'CLOUDFLARE_STREAM',
  ADD COLUMN "providerAssetId" TEXT,
  ADD COLUMN "uploadUrl" TEXT,
  ADD COLUMN "previewUrl" TEXT,
  ADD COLUMN "playbackUrl" TEXT,
  ADD COLUMN "thumbnailUrl" TEXT,
  ADD COLUMN "errorCode" TEXT,
  ADD COLUMN "errorMessage" TEXT,
  ADD COLUMN "readyAt" TIMESTAMP(3),
  ALTER COLUMN "url" DROP NOT NULL;

CREATE UNIQUE INDEX "VideoAsset_providerAssetId_key" ON "VideoAsset"("providerAssetId");
CREATE INDEX "VideoAsset_provider_providerAssetId_idx" ON "VideoAsset"("provider", "providerAssetId");
