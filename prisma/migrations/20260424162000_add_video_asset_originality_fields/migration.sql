ALTER TABLE "VideoAsset"
ADD COLUMN "originalityConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "originalityConfirmedAt" TIMESTAMP(3),
ADD COLUMN "originalityDeclarationText" TEXT;
