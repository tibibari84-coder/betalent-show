-- CreateEnum
CREATE TYPE "SeasonStatus" AS ENUM ('DRAFT', 'UPCOMING', 'LIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StageType" AS ENUM ('AUDITION', 'CALLBACK', 'SEMIFINAL', 'FINAL', 'SPECIAL');

-- CreateEnum
CREATE TYPE "StageStatus" AS ENUM ('DRAFT', 'UPCOMING', 'OPEN', 'JUDGING', 'VOTING', 'RESULTS', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EpisodeStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AuditionWindowStatus" AS ENUM ('DRAFT', 'UPCOMING', 'OPEN', 'CLOSED', 'REVIEW', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AuditionSubmissionType" AS ENUM ('ORIGINAL_SONG', 'ORIGINAL_TOPLINE', 'ORIGINAL_INSTRUMENTAL');

-- CreateEnum
CREATE TYPE "AuditionRightsStatus" AS ENUM ('UNKNOWN', 'ELIGIBLE', 'REVIEW_REQUIRED', 'REJECTED_RIGHTS');

-- CreateEnum
CREATE TYPE "AuditionSubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AuditionReviewDecisionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "ContestantStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ELIMINATED', 'WINNER', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PerformanceKind" AS ENUM ('AUDITION', 'CALLBACK', 'SEMIFINAL', 'FINAL', 'SPECIAL');

-- CreateEnum
CREATE TYPE "PerformanceStatus" AS ENUM ('DRAFT', 'ACCEPTED', 'SCHEDULED', 'PUBLISHED', 'JUDGED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StageResultStatus" AS ENUM ('DRAFT', 'LOCKED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AdvancementDecisionKind" AS ENUM ('ADVANCED', 'ELIMINATED', 'HOLD', 'PENDING', 'WINNER', 'RUNNER_UP', 'WILDCARD');

-- CreateEnum
CREATE TYPE "EditorialPageScope" AS ENUM ('HOME', 'SHOW', 'RESULTS', 'PROFILE', 'ARCHIVE', 'GLOBAL');

-- CreateEnum
CREATE TYPE "EditorialSlotStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "EditorialTargetType" AS ENUM ('SEASON', 'STAGE', 'EPISODE', 'PERFORMANCE', 'CONTESTANT', 'STAGE_RESULT');

-- CreateEnum
CREATE TYPE "EditorialPlacementStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AIOutputKind" AS ENUM ('JUDGE', 'HOST', 'PRODUCER');

-- CreateEnum
CREATE TYPE "AIOutputTargetType" AS ENUM ('PERFORMANCE', 'STAGE', 'EPISODE', 'STAGE_RESULT', 'EDITORIAL_PLACEMENT');

-- CreateEnum
CREATE TYPE "AIOutputStatus" AS ENUM ('DRAFT', 'GENERATED', 'REVIEWED', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "username" TEXT,
    "city" TEXT,
    "country" TEXT,
    "wantsToAudition" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompletedAt" TIMESTAMP(3),
    "emailVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "SeasonStatus" NOT NULL DEFAULT 'DRAFT',
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "stageType" "StageType" NOT NULL,
    "status" "StageStatus" NOT NULL DEFAULT 'DRAFT',
    "submissionsOpenAt" TIMESTAMP(3),
    "submissionsCloseAt" TIMESTAMP(3),
    "judgingOpenAt" TIMESTAMP(3),
    "judgingCloseAt" TIMESTAMP(3),
    "votingOpenAt" TIMESTAMP(3),
    "votingCloseAt" TIMESTAMP(3),
    "resultsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "stageId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "status" "EpisodeStatus" NOT NULL DEFAULT 'DRAFT',
    "premiereAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contestant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "status" "ContestantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contestant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Performance" (
    "id" TEXT NOT NULL,
    "contestantId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "stageId" TEXT,
    "episodeId" TEXT,
    "sourceAuditionSubmissionId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "performanceType" "PerformanceKind" NOT NULL,
    "status" "PerformanceStatus" NOT NULL DEFAULT 'DRAFT',
    "mediaRef" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageResult" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "status" "StageResultStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageResultEntry" (
    "id" TEXT NOT NULL,
    "stageResultId" TEXT NOT NULL,
    "performanceId" TEXT NOT NULL,
    "contestantId" TEXT NOT NULL,
    "placementOrder" INTEGER NOT NULL,
    "highlightLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StageResultEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvancementDecision" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "contestantId" TEXT NOT NULL,
    "performanceId" TEXT,
    "decision" "AdvancementDecisionKind" NOT NULL,
    "decidedAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "stageResultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdvancementDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditorialSlot" (
    "id" TEXT NOT NULL,
    "slotKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "pageScope" "EditorialPageScope" NOT NULL,
    "status" "EditorialSlotStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditorialSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditorialPlacement" (
    "id" TEXT NOT NULL,
    "editorialSlotId" TEXT NOT NULL,
    "targetType" "EditorialTargetType" NOT NULL,
    "seasonId" TEXT,
    "stageId" TEXT,
    "episodeId" TEXT,
    "performanceId" TEXT,
    "contestantId" TEXT,
    "stageResultId" TEXT,
    "headline" TEXT,
    "subheadline" TEXT,
    "ctaLabel" TEXT,
    "sortOrder" INTEGER,
    "status" "EditorialPlacementStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditorialPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIOutput" (
    "id" TEXT NOT NULL,
    "kind" "AIOutputKind" NOT NULL,
    "targetType" "AIOutputTargetType" NOT NULL,
    "performanceId" TEXT,
    "stageId" TEXT,
    "episodeId" TEXT,
    "stageResultId" TEXT,
    "editorialPlacementId" TEXT,
    "status" "AIOutputStatus" NOT NULL DEFAULT 'DRAFT',
    "promptVersion" TEXT,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "metaJson" JSONB,
    "generatedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIOutput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditionWindow" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT,
    "stageId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "AuditionWindowStatus" NOT NULL DEFAULT 'DRAFT',
    "opensAt" TIMESTAMP(3) NOT NULL,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "reviewStartsAt" TIMESTAMP(3),
    "reviewEndsAt" TIMESTAMP(3),
    "maxSubmissionsPerUser" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditionWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditionSubmission" (
    "id" TEXT NOT NULL,
    "auditionWindowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "submissionType" "AuditionSubmissionType" NOT NULL,
    "rightsStatus" "AuditionRightsStatus" NOT NULL DEFAULT 'UNKNOWN',
    "status" "AuditionSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "externalMediaRef" TEXT,
    "mediaUrl" TEXT,
    "mediaOriginalName" TEXT,
    "mediaSize" INTEGER,
    "mediaMimeType" TEXT,
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditionSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditionReview" (
    "id" TEXT NOT NULL,
    "auditionSubmissionId" TEXT NOT NULL,
    "reviewerUserId" TEXT,
    "status" "AuditionReviewDecisionStatus" NOT NULL,
    "decisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditionReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_slug_key" ON "Season"("slug");

-- CreateIndex
CREATE INDEX "Season_status_startAt_idx" ON "Season"("status", "startAt");

-- CreateIndex
CREATE INDEX "Stage_seasonId_status_orderIndex_idx" ON "Stage"("seasonId", "status", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Stage_seasonId_slug_key" ON "Stage"("seasonId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Stage_seasonId_orderIndex_key" ON "Stage"("seasonId", "orderIndex");

-- CreateIndex
CREATE INDEX "Episode_seasonId_status_premiereAt_idx" ON "Episode"("seasonId", "status", "premiereAt");

-- CreateIndex
CREATE INDEX "Episode_stageId_status_premiereAt_idx" ON "Episode"("stageId", "status", "premiereAt");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_seasonId_slug_key" ON "Episode"("seasonId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_seasonId_orderIndex_key" ON "Episode"("seasonId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Contestant_userId_key" ON "Contestant"("userId");

-- CreateIndex
CREATE INDEX "Contestant_status_idx" ON "Contestant"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Performance_sourceAuditionSubmissionId_key" ON "Performance"("sourceAuditionSubmissionId");

-- CreateIndex
CREATE INDEX "Performance_seasonId_status_idx" ON "Performance"("seasonId", "status");

-- CreateIndex
CREATE INDEX "Performance_contestantId_seasonId_idx" ON "Performance"("contestantId", "seasonId");

-- CreateIndex
CREATE INDEX "Performance_stageId_idx" ON "Performance"("stageId");

-- CreateIndex
CREATE INDEX "Performance_episodeId_idx" ON "Performance"("episodeId");

-- CreateIndex
CREATE INDEX "StageResult_seasonId_stageId_status_idx" ON "StageResult"("seasonId", "stageId", "status");

-- CreateIndex
CREATE INDEX "StageResult_status_publishedAt_idx" ON "StageResult"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "StageResultEntry_stageResultId_idx" ON "StageResultEntry"("stageResultId");

-- CreateIndex
CREATE UNIQUE INDEX "StageResultEntry_stageResultId_placementOrder_key" ON "StageResultEntry"("stageResultId", "placementOrder");

-- CreateIndex
CREATE UNIQUE INDEX "StageResultEntry_stageResultId_performanceId_key" ON "StageResultEntry"("stageResultId", "performanceId");

-- CreateIndex
CREATE INDEX "AdvancementDecision_seasonId_stageId_idx" ON "AdvancementDecision"("seasonId", "stageId");

-- CreateIndex
CREATE INDEX "AdvancementDecision_contestantId_decidedAt_idx" ON "AdvancementDecision"("contestantId", "decidedAt");

-- CreateIndex
CREATE INDEX "AdvancementDecision_stageResultId_idx" ON "AdvancementDecision"("stageResultId");

-- CreateIndex
CREATE UNIQUE INDEX "EditorialSlot_slotKey_key" ON "EditorialSlot"("slotKey");

-- CreateIndex
CREATE INDEX "EditorialSlot_pageScope_status_idx" ON "EditorialSlot"("pageScope", "status");

-- CreateIndex
CREATE INDEX "EditorialPlacement_editorialSlotId_status_idx" ON "EditorialPlacement"("editorialSlotId", "status");

-- CreateIndex
CREATE INDEX "EditorialPlacement_status_publishedAt_idx" ON "EditorialPlacement"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "EditorialPlacement_editorialSlotId_sortOrder_idx" ON "EditorialPlacement"("editorialSlotId", "sortOrder");

-- CreateIndex
CREATE INDEX "AIOutput_kind_status_updatedAt_idx" ON "AIOutput"("kind", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "AIOutput_kind_targetType_performanceId_idx" ON "AIOutput"("kind", "targetType", "performanceId");

-- CreateIndex
CREATE INDEX "AIOutput_kind_targetType_stageId_idx" ON "AIOutput"("kind", "targetType", "stageId");

-- CreateIndex
CREATE INDEX "AIOutput_kind_targetType_episodeId_idx" ON "AIOutput"("kind", "targetType", "episodeId");

-- CreateIndex
CREATE INDEX "AIOutput_kind_targetType_stageResultId_idx" ON "AIOutput"("kind", "targetType", "stageResultId");

-- CreateIndex
CREATE INDEX "AIOutput_kind_targetType_editorialPlacementId_idx" ON "AIOutput"("kind", "targetType", "editorialPlacementId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditionWindow_slug_key" ON "AuditionWindow"("slug");

-- CreateIndex
CREATE INDEX "AuditionWindow_status_opensAt_closesAt_idx" ON "AuditionWindow"("status", "opensAt", "closesAt");

-- CreateIndex
CREATE INDEX "AuditionWindow_seasonId_idx" ON "AuditionWindow"("seasonId");

-- CreateIndex
CREATE INDEX "AuditionWindow_stageId_idx" ON "AuditionWindow"("stageId");

-- CreateIndex
CREATE INDEX "AuditionSubmission_auditionWindowId_userId_idx" ON "AuditionSubmission"("auditionWindowId", "userId");

-- CreateIndex
CREATE INDEX "AuditionSubmission_userId_status_idx" ON "AuditionSubmission"("userId", "status");

-- CreateIndex
CREATE INDEX "AuditionSubmission_auditionWindowId_status_idx" ON "AuditionSubmission"("auditionWindowId", "status");

-- CreateIndex
CREATE INDEX "AuditionReview_auditionSubmissionId_createdAt_idx" ON "AuditionReview"("auditionSubmissionId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditionReview_reviewerUserId_idx" ON "AuditionReview"("reviewerUserId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contestant" ADD CONSTRAINT "Contestant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_contestantId_fkey" FOREIGN KEY ("contestantId") REFERENCES "Contestant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_sourceAuditionSubmissionId_fkey" FOREIGN KEY ("sourceAuditionSubmissionId") REFERENCES "AuditionSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageResult" ADD CONSTRAINT "StageResult_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageResult" ADD CONSTRAINT "StageResult_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageResultEntry" ADD CONSTRAINT "StageResultEntry_stageResultId_fkey" FOREIGN KEY ("stageResultId") REFERENCES "StageResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageResultEntry" ADD CONSTRAINT "StageResultEntry_performanceId_fkey" FOREIGN KEY ("performanceId") REFERENCES "Performance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageResultEntry" ADD CONSTRAINT "StageResultEntry_contestantId_fkey" FOREIGN KEY ("contestantId") REFERENCES "Contestant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvancementDecision" ADD CONSTRAINT "AdvancementDecision_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvancementDecision" ADD CONSTRAINT "AdvancementDecision_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvancementDecision" ADD CONSTRAINT "AdvancementDecision_contestantId_fkey" FOREIGN KEY ("contestantId") REFERENCES "Contestant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvancementDecision" ADD CONSTRAINT "AdvancementDecision_performanceId_fkey" FOREIGN KEY ("performanceId") REFERENCES "Performance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvancementDecision" ADD CONSTRAINT "AdvancementDecision_stageResultId_fkey" FOREIGN KEY ("stageResultId") REFERENCES "StageResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorialPlacement" ADD CONSTRAINT "EditorialPlacement_editorialSlotId_fkey" FOREIGN KEY ("editorialSlotId") REFERENCES "EditorialSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorialPlacement" ADD CONSTRAINT "EditorialPlacement_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorialPlacement" ADD CONSTRAINT "EditorialPlacement_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorialPlacement" ADD CONSTRAINT "EditorialPlacement_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorialPlacement" ADD CONSTRAINT "EditorialPlacement_performanceId_fkey" FOREIGN KEY ("performanceId") REFERENCES "Performance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorialPlacement" ADD CONSTRAINT "EditorialPlacement_contestantId_fkey" FOREIGN KEY ("contestantId") REFERENCES "Contestant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorialPlacement" ADD CONSTRAINT "EditorialPlacement_stageResultId_fkey" FOREIGN KEY ("stageResultId") REFERENCES "StageResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIOutput" ADD CONSTRAINT "AIOutput_performanceId_fkey" FOREIGN KEY ("performanceId") REFERENCES "Performance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIOutput" ADD CONSTRAINT "AIOutput_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIOutput" ADD CONSTRAINT "AIOutput_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIOutput" ADD CONSTRAINT "AIOutput_stageResultId_fkey" FOREIGN KEY ("stageResultId") REFERENCES "StageResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIOutput" ADD CONSTRAINT "AIOutput_editorialPlacementId_fkey" FOREIGN KEY ("editorialPlacementId") REFERENCES "EditorialPlacement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditionWindow" ADD CONSTRAINT "AuditionWindow_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditionWindow" ADD CONSTRAINT "AuditionWindow_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditionSubmission" ADD CONSTRAINT "AuditionSubmission_auditionWindowId_fkey" FOREIGN KEY ("auditionWindowId") REFERENCES "AuditionWindow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditionSubmission" ADD CONSTRAINT "AuditionSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditionReview" ADD CONSTRAINT "AuditionReview_auditionSubmissionId_fkey" FOREIGN KEY ("auditionSubmissionId") REFERENCES "AuditionSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditionReview" ADD CONSTRAINT "AuditionReview_reviewerUserId_fkey" FOREIGN KEY ("reviewerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
