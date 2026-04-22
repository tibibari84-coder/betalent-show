-- Phase 23 engagement foundation:
-- - Submission likes
-- - Creator follows
-- - Submission view events (raw) + aggregate stats
-- - User aggregate follow stats

CREATE TABLE "SubmissionLike" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SubmissionLike_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CreatorFollow" (
  "id" TEXT NOT NULL,
  "followerId" TEXT NOT NULL,
  "creatorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CreatorFollow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubmissionViewEvent" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "viewerUserId" TEXT NOT NULL,
  "viewerKey" TEXT NOT NULL,
  "dayBucket" TIMESTAMP(3) NOT NULL,
  "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SubmissionViewEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubmissionEngagementStat" (
  "submissionId" TEXT NOT NULL,
  "likeCount" INTEGER NOT NULL DEFAULT 0,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SubmissionEngagementStat_pkey" PRIMARY KEY ("submissionId")
);

CREATE TABLE "UserEngagementStat" (
  "userId" TEXT NOT NULL,
  "followerCount" INTEGER NOT NULL DEFAULT 0,
  "followingCount" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UserEngagementStat_pkey" PRIMARY KEY ("userId")
);

CREATE UNIQUE INDEX "SubmissionLike_submissionId_userId_key" ON "SubmissionLike"("submissionId", "userId");
CREATE INDEX "SubmissionLike_submissionId_createdAt_idx" ON "SubmissionLike"("submissionId", "createdAt");
CREATE INDEX "SubmissionLike_userId_createdAt_idx" ON "SubmissionLike"("userId", "createdAt");

CREATE UNIQUE INDEX "CreatorFollow_followerId_creatorId_key" ON "CreatorFollow"("followerId", "creatorId");
CREATE INDEX "CreatorFollow_creatorId_createdAt_idx" ON "CreatorFollow"("creatorId", "createdAt");
CREATE INDEX "CreatorFollow_followerId_createdAt_idx" ON "CreatorFollow"("followerId", "createdAt");

CREATE UNIQUE INDEX "SubmissionViewEvent_submissionId_viewerKey_dayBucket_key" ON "SubmissionViewEvent"("submissionId", "viewerKey", "dayBucket");
CREATE INDEX "SubmissionViewEvent_submissionId_viewedAt_idx" ON "SubmissionViewEvent"("submissionId", "viewedAt");
CREATE INDEX "SubmissionViewEvent_viewerUserId_viewedAt_idx" ON "SubmissionViewEvent"("viewerUserId", "viewedAt");

ALTER TABLE "SubmissionLike"
ADD CONSTRAINT "SubmissionLike_submissionId_fkey"
FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SubmissionLike"
ADD CONSTRAINT "SubmissionLike_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CreatorFollow"
ADD CONSTRAINT "CreatorFollow_followerId_fkey"
FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CreatorFollow"
ADD CONSTRAINT "CreatorFollow_creatorId_fkey"
FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SubmissionViewEvent"
ADD CONSTRAINT "SubmissionViewEvent_submissionId_fkey"
FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SubmissionViewEvent"
ADD CONSTRAINT "SubmissionViewEvent_viewerUserId_fkey"
FOREIGN KEY ("viewerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SubmissionEngagementStat"
ADD CONSTRAINT "SubmissionEngagementStat_submissionId_fkey"
FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserEngagementStat"
ADD CONSTRAINT "UserEngagementStat_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
