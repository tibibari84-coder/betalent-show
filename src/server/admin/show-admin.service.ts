import {
  EpisodeStatus,
  SeasonStatus,
  StageStatus,
  StageType,
  SubmissionStatus,
} from "@prisma/client";
import { z } from "zod";

import { POSTHOG_EVENTS, trackEvent } from "@/lib/analytics/posthog";
import {
  sendSubmissionReceivedEmail,
  sendSubmissionStatusChangedEmail,
} from "@/lib/email/resend";
import { captureMessage } from "@/lib/sentry";
import { prisma } from "@/server/db/prisma";
import {
  prepareSubmissionStatusChange,
} from "@/server/submissions/lifecycle";
import { writeAuditLog } from "./audit-log.service";

export { allowedSubmissionTransitions } from "@/server/submissions/lifecycle";

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Invalid date value.");
    }
    return parsed;
  });

const requiredText = z.string().trim().min(1, "This field is required.");
const optionalText = z.string().trim().optional().transform((value) => value || null);
const optionalForeignKey = z.string().trim().optional().transform((value) => value || null);

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const seasonSchema = z.object({
  id: z.string().trim().optional(),
  slug: z.string().trim().optional(),
  title: requiredText,
  description: optionalText,
  status: z.nativeEnum(SeasonStatus),
  startAt: optionalDate,
  endAt: optionalDate,
});

const stageSchema = z.object({
  id: z.string().trim().optional(),
  seasonId: requiredText,
  slug: z.string().trim().optional(),
  title: requiredText,
  description: optionalText,
  orderIndex: z.coerce.number().int().min(0),
  stageType: z.nativeEnum(StageType),
  status: z.nativeEnum(StageStatus),
  submissionsOpenAt: optionalDate,
  submissionsCloseAt: optionalDate,
  judgingOpenAt: optionalDate,
  judgingCloseAt: optionalDate,
  votingOpenAt: optionalDate,
  votingCloseAt: optionalDate,
  resultsAt: optionalDate,
});

const episodeSchema = z.object({
  id: z.string().trim().optional(),
  seasonId: requiredText,
  stageId: optionalForeignKey,
  slug: z.string().trim().optional(),
  title: requiredText,
  description: optionalText,
  orderIndex: z.coerce.number().int().min(0),
  status: z.nativeEnum(EpisodeStatus),
  premiereAt: optionalDate,
  publishedAt: optionalDate,
});

const archiveSchema = z.object({
  id: requiredText,
  confirmText: z.literal("ARCHIVE"),
});

const submissionStatusSchema = z.object({
  id: requiredText,
  status: z.nativeEnum(SubmissionStatus),
});

export const allowedSeasonTransitions: Record<SeasonStatus, SeasonStatus[]> = {
  DRAFT: [SeasonStatus.UPCOMING, SeasonStatus.ARCHIVED],
  UPCOMING: [SeasonStatus.DRAFT, SeasonStatus.LIVE, SeasonStatus.ARCHIVED],
  LIVE: [SeasonStatus.COMPLETED, SeasonStatus.ARCHIVED],
  COMPLETED: [SeasonStatus.ARCHIVED],
  ARCHIVED: [],
};

export const allowedStageTransitions: Record<StageStatus, StageStatus[]> = {
  DRAFT: [StageStatus.UPCOMING, StageStatus.ARCHIVED],
  UPCOMING: [StageStatus.DRAFT, StageStatus.OPEN, StageStatus.ARCHIVED],
  OPEN: [StageStatus.JUDGING, StageStatus.VOTING, StageStatus.RESULTS, StageStatus.COMPLETED, StageStatus.ARCHIVED],
  JUDGING: [StageStatus.VOTING, StageStatus.RESULTS, StageStatus.COMPLETED, StageStatus.ARCHIVED],
  VOTING: [StageStatus.RESULTS, StageStatus.COMPLETED, StageStatus.ARCHIVED],
  RESULTS: [StageStatus.COMPLETED, StageStatus.ARCHIVED],
  COMPLETED: [StageStatus.ARCHIVED],
  ARCHIVED: [],
};

export const allowedEpisodeTransitions: Record<EpisodeStatus, EpisodeStatus[]> = {
  DRAFT: [EpisodeStatus.SCHEDULED, EpisodeStatus.ARCHIVED],
  SCHEDULED: [EpisodeStatus.DRAFT, EpisodeStatus.PUBLISHED, EpisodeStatus.ARCHIVED],
  PUBLISHED: [EpisodeStatus.ARCHIVED],
  ARCHIVED: [],
};

const allowedSeasonCreationStatuses = new Set<SeasonStatus>([SeasonStatus.DRAFT, SeasonStatus.UPCOMING]);
const allowedStageCreationStatuses = new Set<StageStatus>([StageStatus.DRAFT, StageStatus.UPCOMING]);
const allowedEpisodeCreationStatuses = new Set<EpisodeStatus>([EpisodeStatus.DRAFT, EpisodeStatus.SCHEDULED]);

function ensureTransition<T extends string>(from: T, to: T, allowedMap: Record<T, T[]>, entityLabel: string) {
  if (from === to) return;
  if (!allowedMap[from].includes(to)) {
    throw new Error(`${entityLabel} cannot move from ${from} to ${to}.`);
  }
}

function ensureDateOrder(openAt: Date | null, closeAt: Date | null, label: string) {
  if (openAt && closeAt && openAt.getTime() >= closeAt.getTime()) {
    throw new Error(`${label} open date must be before close date.`);
  }
}

function ensureChronology(startAt: Date | null, endAt: Date | null, entityLabel: string) {
  if (startAt && endAt && startAt.getTime() >= endAt.getTime()) {
    throw new Error(`${entityLabel} start date must be before end date.`);
  }
}

function ensureCreateStatus<T extends string>(status: T, allowedStatuses: Set<T>, entityLabel: string) {
  if (!allowedStatuses.has(status)) {
    throw new Error(`${entityLabel} records must start in a safe draft or scheduled state. Publish or archive them explicitly after creation.`);
  }
}

async function ensureSingleLiveSeason(nextStatus: SeasonStatus, ignoreSeasonId?: string) {
  if (nextStatus !== SeasonStatus.LIVE) return;

  const existingLive = await prisma.season.findFirst({
    where: {
      status: SeasonStatus.LIVE,
      ...(ignoreSeasonId ? { id: { not: ignoreSeasonId } } : {}),
    },
    select: { id: true, title: true },
  });

  if (existingLive) {
    throw new Error(`Season "${existingLive.title}" is already ACTIVE (LIVE in schema). Complete or archive it before activating another season.`);
  }
}

function ensureStageStatusAllowedForSeason(stageStatus: StageStatus, seasonStatus: SeasonStatus) {
  if (stageStatus === StageStatus.ARCHIVED || stageStatus === StageStatus.DRAFT) {
    return;
  }

  if (seasonStatus === SeasonStatus.DRAFT || seasonStatus === SeasonStatus.ARCHIVED) {
    throw new Error("Stage activation is blocked until the parent season leaves DRAFT and is not archived.");
  }

  if (
    (stageStatus === StageStatus.OPEN ||
      stageStatus === StageStatus.JUDGING ||
      stageStatus === StageStatus.VOTING ||
      stageStatus === StageStatus.RESULTS ||
      stageStatus === StageStatus.COMPLETED) &&
    seasonStatus !== SeasonStatus.LIVE &&
    seasonStatus !== SeasonStatus.COMPLETED
  ) {
    throw new Error("Only ACTIVE (LIVE in schema) or COMPLETED seasons can hold active, judging, voting, results, or completed stages.");
  }
}

function ensureEpisodeStatusAllowedForContext(
  episodeStatus: EpisodeStatus,
  seasonStatus: SeasonStatus,
  stageStatus: StageStatus | null,
) {
  if (episodeStatus === EpisodeStatus.ARCHIVED || episodeStatus === EpisodeStatus.DRAFT) {
    return;
  }

  if (seasonStatus === SeasonStatus.DRAFT || seasonStatus === SeasonStatus.ARCHIVED) {
    throw new Error("Episode scheduling or publishing is blocked until the parent season is no longer draft or archived.");
  }

  if (episodeStatus === EpisodeStatus.PUBLISHED) {
    if (seasonStatus !== SeasonStatus.LIVE && seasonStatus !== SeasonStatus.COMPLETED) {
      throw new Error("Episodes can only be published while the parent season is ACTIVE (LIVE in schema) or COMPLETED.");
    }

    if (stageStatus && stageStatus !== StageStatus.OPEN && stageStatus !== StageStatus.JUDGING && stageStatus !== StageStatus.VOTING && stageStatus !== StageStatus.RESULTS && stageStatus !== StageStatus.COMPLETED) {
      throw new Error("Episodes linked to a stage can only be published when that stage is operational or completed.");
    }
  }
}

export function parseSeasonInput(formData: FormData) {
  return seasonSchema.parse({
    id: formData.get("id") ?? undefined,
    slug: formData.get("slug") ?? undefined,
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    status: formData.get("status"),
    startAt: formData.get("startAt") ?? undefined,
    endAt: formData.get("endAt") ?? undefined,
  });
}

export function parseStageInput(formData: FormData) {
  return stageSchema.parse({
    id: formData.get("id") ?? undefined,
    seasonId: formData.get("seasonId"),
    slug: formData.get("slug") ?? undefined,
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    orderIndex: formData.get("orderIndex"),
    stageType: formData.get("stageType"),
    status: formData.get("status"),
    submissionsOpenAt: formData.get("submissionsOpenAt") ?? undefined,
    submissionsCloseAt: formData.get("submissionsCloseAt") ?? undefined,
    judgingOpenAt: formData.get("judgingOpenAt") ?? undefined,
    judgingCloseAt: formData.get("judgingCloseAt") ?? undefined,
    votingOpenAt: formData.get("votingOpenAt") ?? undefined,
    votingCloseAt: formData.get("votingCloseAt") ?? undefined,
    resultsAt: formData.get("resultsAt") ?? undefined,
  });
}

export function parseEpisodeInput(formData: FormData) {
  return episodeSchema.parse({
    id: formData.get("id") ?? undefined,
    seasonId: formData.get("seasonId"),
    stageId: formData.get("stageId") ?? undefined,
    slug: formData.get("slug") ?? undefined,
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    orderIndex: formData.get("orderIndex"),
    status: formData.get("status"),
    premiereAt: formData.get("premiereAt") ?? undefined,
    publishedAt: formData.get("publishedAt") ?? undefined,
  });
}

export function parseArchiveInput(formData: FormData) {
  return archiveSchema.parse({
    id: formData.get("id"),
    confirmText: formData.get("confirmText"),
  });
}

export function parseSubmissionStatusInput(formData: FormData) {
  return submissionStatusSchema.parse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
}

export async function createSeasonMutation(actorUserId: string, input: ReturnType<typeof parseSeasonInput>) {
  ensureCreateStatus(input.status, allowedSeasonCreationStatuses, "Season");
  ensureChronology(input.startAt, input.endAt, "Season");
  await ensureSingleLiveSeason(input.status);

  const slug = input.slug ? slugify(input.slug) : slugify(input.title);
  if (!slug) {
    throw new Error("Season slug is required.");
  }

  const row = await prisma.season.create({
    data: {
      slug,
      title: input.title,
      description: input.description,
      status: input.status,
      startAt: input.startAt,
      endAt: input.endAt,
    },
  });

  await writeAuditLog({
    userId: actorUserId,
    action: "season.create",
    entityType: "Season",
    entityId: row.id,
    details: { slug: row.slug, status: row.status, title: row.title },
  });

  return row;
}

export async function updateSeasonMutation(actorUserId: string, input: ReturnType<typeof parseSeasonInput>) {
  if (!input.id) throw new Error("Season id is required.");

  const current = await prisma.season.findUnique({ where: { id: input.id } });
  if (!current) throw new Error("Season not found.");

  ensureTransition(current.status, input.status, allowedSeasonTransitions, "Season");
  ensureChronology(input.startAt, input.endAt, "Season");
  await ensureSingleLiveSeason(input.status, current.id);

  const slug = input.slug ? slugify(input.slug) : slugify(input.title);
  if (!slug) throw new Error("Season slug is required.");

  const row = await prisma.season.update({
    where: { id: input.id },
    data: {
      slug,
      title: input.title,
      description: input.description,
      status: input.status,
      startAt: input.startAt,
      endAt: input.endAt,
    },
  });

  await writeAuditLog({
    userId: actorUserId,
    action: "season.update",
    entityType: "Season",
    entityId: row.id,
    details: {
      previousStatus: current.status,
      nextStatus: row.status,
      slug: row.slug,
      title: row.title,
    },
  });

  return row;
}

export async function archiveSeasonMutation(actorUserId: string, input: ReturnType<typeof parseArchiveInput>) {
  const current = await prisma.season.findUnique({
    where: { id: input.id },
    include: {
      _count: {
        select: {
          stages: {
            where: {
              status: { not: StageStatus.ARCHIVED },
            },
          },
          episodes: {
            where: {
              status: { not: EpisodeStatus.ARCHIVED },
            },
          },
        },
      },
    },
  });
  if (!current) throw new Error("Season not found.");

  ensureTransition(current.status, SeasonStatus.ARCHIVED, allowedSeasonTransitions, "Season");

  if (current._count.stages > 0 || current._count.episodes > 0) {
    throw new Error("Archive child stages and episodes first. Public or operational children cannot remain attached to an archived season.");
  }

  const row = await prisma.season.update({
    where: { id: input.id },
    data: { status: SeasonStatus.ARCHIVED },
  });

  await writeAuditLog({
    userId: actorUserId,
    action: "season.archive",
    entityType: "Season",
    entityId: row.id,
    details: { previousStatus: current.status, nextStatus: row.status, title: row.title },
  });

  return row;
}

export async function createStageMutation(actorUserId: string, input: ReturnType<typeof parseStageInput>) {
  ensureCreateStatus(input.status, allowedStageCreationStatuses, "Stage");

  const season = await prisma.season.findUnique({
    where: { id: input.seasonId },
    select: { id: true, status: true, title: true },
  });
  if (!season) throw new Error("Season not found.");

  ensureDateOrder(input.submissionsOpenAt, input.submissionsCloseAt, "Submission");
  ensureDateOrder(input.judgingOpenAt, input.judgingCloseAt, "Judging");
  ensureDateOrder(input.votingOpenAt, input.votingCloseAt, "Voting");
  ensureStageStatusAllowedForSeason(input.status, season.status);

  const slug = input.slug ? slugify(input.slug) : slugify(input.title);
  if (!slug) throw new Error("Stage slug is required.");

  const row = await prisma.stage.create({
    data: {
      seasonId: input.seasonId,
      slug,
      title: input.title,
      description: input.description,
      orderIndex: input.orderIndex,
      stageType: input.stageType,
      status: input.status,
      submissionsOpenAt: input.submissionsOpenAt,
      submissionsCloseAt: input.submissionsCloseAt,
      judgingOpenAt: input.judgingOpenAt,
      judgingCloseAt: input.judgingCloseAt,
      votingOpenAt: input.votingOpenAt,
      votingCloseAt: input.votingCloseAt,
      resultsAt: input.resultsAt,
    },
  });

  await writeAuditLog({
    userId: actorUserId,
    action: "stage.create",
    entityType: "Stage",
    entityId: row.id,
    details: {
      seasonId: row.seasonId,
      slug: row.slug,
      stageType: row.stageType,
      status: row.status,
      title: row.title,
    },
  });

  return row;
}

export async function updateStageMutation(actorUserId: string, input: ReturnType<typeof parseStageInput>) {
  if (!input.id) throw new Error("Stage id is required.");

  const current = await prisma.stage.findUnique({ where: { id: input.id } });
  if (!current) throw new Error("Stage not found.");

  const season = await prisma.season.findUnique({
    where: { id: input.seasonId },
    select: { id: true, status: true, title: true },
  });
  if (!season) throw new Error("Season not found.");

  ensureTransition(current.status, input.status, allowedStageTransitions, "Stage");
  ensureDateOrder(input.submissionsOpenAt, input.submissionsCloseAt, "Submission");
  ensureDateOrder(input.judgingOpenAt, input.judgingCloseAt, "Judging");
  ensureDateOrder(input.votingOpenAt, input.votingCloseAt, "Voting");
  ensureStageStatusAllowedForSeason(input.status, season.status);

  const slug = input.slug ? slugify(input.slug) : slugify(input.title);
  if (!slug) throw new Error("Stage slug is required.");

  const row = await prisma.stage.update({
    where: { id: input.id },
    data: {
      seasonId: input.seasonId,
      slug,
      title: input.title,
      description: input.description,
      orderIndex: input.orderIndex,
      stageType: input.stageType,
      status: input.status,
      submissionsOpenAt: input.submissionsOpenAt,
      submissionsCloseAt: input.submissionsCloseAt,
      judgingOpenAt: input.judgingOpenAt,
      judgingCloseAt: input.judgingCloseAt,
      votingOpenAt: input.votingOpenAt,
      votingCloseAt: input.votingCloseAt,
      resultsAt: input.resultsAt,
    },
  });

  await writeAuditLog({
    userId: actorUserId,
    action: "stage.update",
    entityType: "Stage",
    entityId: row.id,
    details: {
      previousStatus: current.status,
      nextStatus: row.status,
      seasonId: row.seasonId,
      slug: row.slug,
      stageType: row.stageType,
      title: row.title,
    },
  });

  return row;
}

export async function archiveStageMutation(actorUserId: string, input: ReturnType<typeof parseArchiveInput>) {
  const current = await prisma.stage.findUnique({
    where: { id: input.id },
    include: {
      _count: {
        select: {
          episodes: {
            where: {
              status: { not: EpisodeStatus.ARCHIVED },
            },
          },
        },
      },
    },
  });
  if (!current) throw new Error("Stage not found.");

  ensureTransition(current.status, StageStatus.ARCHIVED, allowedStageTransitions, "Stage");

  if (current._count.episodes > 0) {
    throw new Error("Archive linked episodes first. An archived stage cannot leave scheduled or published episodes behind.");
  }

  const row = await prisma.stage.update({
    where: { id: input.id },
    data: { status: StageStatus.ARCHIVED },
  });

  await writeAuditLog({
    userId: actorUserId,
    action: "stage.archive",
    entityType: "Stage",
    entityId: row.id,
    details: { previousStatus: current.status, nextStatus: row.status, title: row.title },
  });

  return row;
}

export async function createEpisodeMutation(actorUserId: string, input: ReturnType<typeof parseEpisodeInput>) {
  ensureCreateStatus(input.status, allowedEpisodeCreationStatuses, "Episode");

  const season = await prisma.season.findUnique({
    where: { id: input.seasonId },
    select: { id: true, status: true, title: true },
  });
  if (!season) throw new Error("Season not found.");

  let stageStatus: StageStatus | null = null;
  if (input.stageId) {
    const stage = await prisma.stage.findFirst({
      where: { id: input.stageId, seasonId: input.seasonId },
      select: { id: true, status: true },
    });
    if (!stage) {
      throw new Error("Stage must belong to the selected season.");
    }
    stageStatus = stage.status;
  }

  ensureEpisodeStatusAllowedForContext(input.status, season.status, stageStatus);

  const slug = input.slug ? slugify(input.slug) : slugify(input.title);
  if (!slug) throw new Error("Episode slug is required.");

  const row = await prisma.episode.create({
    data: {
      seasonId: input.seasonId,
      stageId: input.stageId,
      slug,
      title: input.title,
      description: input.description,
      orderIndex: input.orderIndex,
      status: input.status,
      premiereAt: input.premiereAt,
      publishedAt: input.publishedAt,
    },
  });

  await writeAuditLog({
    userId: actorUserId,
    action: "episode.create",
    entityType: "Episode",
    entityId: row.id,
    details: {
      seasonId: row.seasonId,
      stageId: row.stageId,
      slug: row.slug,
      status: row.status,
      title: row.title,
    },
  });

  return row;
}

export async function updateEpisodeMutation(actorUserId: string, input: ReturnType<typeof parseEpisodeInput>) {
  if (!input.id) throw new Error("Episode id is required.");

  const current = await prisma.episode.findUnique({ where: { id: input.id } });
  if (!current) throw new Error("Episode not found.");

  ensureTransition(current.status, input.status, allowedEpisodeTransitions, "Episode");

  const season = await prisma.season.findUnique({
    where: { id: input.seasonId },
    select: { id: true, status: true, title: true },
  });
  if (!season) throw new Error("Season not found.");

  let stageStatus: StageStatus | null = null;
  if (input.stageId) {
    const stage = await prisma.stage.findFirst({
      where: { id: input.stageId, seasonId: input.seasonId },
      select: { id: true, status: true },
    });
    if (!stage) {
      throw new Error("Stage must belong to the selected season.");
    }
    stageStatus = stage.status;
  }

  ensureEpisodeStatusAllowedForContext(input.status, season.status, stageStatus);
  const slug = input.slug ? slugify(input.slug) : slugify(input.title);
  if (!slug) throw new Error("Episode slug is required.");

  const effectivePublishedAt =
    input.status === EpisodeStatus.PUBLISHED ? input.publishedAt ?? current.publishedAt ?? new Date() : null;

  const row = await prisma.episode.update({
    where: { id: input.id },
    data: {
      seasonId: input.seasonId,
      stageId: input.stageId,
      slug,
      title: input.title,
      description: input.description,
      orderIndex: input.orderIndex,
      status: input.status,
      premiereAt: input.premiereAt,
      publishedAt: effectivePublishedAt,
    },
  });

  await writeAuditLog({
    userId: actorUserId,
    action: "episode.update",
    entityType: "Episode",
    entityId: row.id,
    details: {
      previousStatus: current.status,
      nextStatus: row.status,
      seasonId: row.seasonId,
      stageId: row.stageId,
      slug: row.slug,
      title: row.title,
    },
  });

  return row;
}

export async function archiveEpisodeMutation(actorUserId: string, input: ReturnType<typeof parseArchiveInput>) {
  const current = await prisma.episode.findUnique({ where: { id: input.id } });
  if (!current) throw new Error("Episode not found.");

  ensureTransition(current.status, EpisodeStatus.ARCHIVED, allowedEpisodeTransitions, "Episode");

  const row = await prisma.episode.update({
    where: { id: input.id },
    data: { status: EpisodeStatus.ARCHIVED },
  });

  await writeAuditLog({
    userId: actorUserId,
    action: "episode.archive",
    entityType: "Episode",
    entityId: row.id,
    details: { previousStatus: current.status, nextStatus: row.status, title: row.title },
  });

  return row;
}

export async function updateSubmissionReviewStatusMutation(
  actorUserId: string,
  input: ReturnType<typeof parseSubmissionStatusInput>,
) {
  const current = await prisma.submission.findUnique({
    where: { id: input.id },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          username: true,
        },
      },
      videoAsset: {
        select: {
          id: true,
          status: true,
          originalName: true,
        },
      },
      judgeResults: true,
    },
  });

  if (!current) throw new Error("Submission not found.");

  if (!current.submittedAt && input.status !== SubmissionStatus.DRAFT && input.status !== SubmissionStatus.WITHDRAWN) {
    if (current.status === SubmissionStatus.DRAFT) {
      throw new Error("Draft submissions must be formally submitted before review.");
    }
  }

  const transition = prepareSubmissionStatusChange({
    currentStatus: current.status,
    nextStatus: input.status,
    currentSubmittedAt: current.submittedAt,
    assetStatus: current.videoAsset.status,
  });

  const updated = await prisma.submission.update({
    where: { id: input.id },
    data: {
      status: input.status,
      submittedAt: transition.submittedAt,
    },
    include: {
      user: true,
      videoAsset: true,
      judgeResults: {
        include: { judge: true },
      },
    },
  });

  await writeAuditLog({
    userId: actorUserId,
    action: "submission.review_status",
    entityType: "Submission",
    entityId: updated.id,
    details: {
      previousStatus: current.status,
      nextStatus: updated.status,
      userId: updated.userId,
      videoAssetId: updated.videoAssetId,
      title: updated.title,
      videoAssetStatus: current.videoAsset.status,
      judgeResultCount: current.judgeResults.length,
      lifecycleNote: transition.lifecycleNote,
    },
  });

  await trackEvent(POSTHOG_EVENTS.admin_submission_reviewed, {
    distinctId: actorUserId,
    submissionId: updated.id,
    reviewedUserId: updated.userId,
    previousStatus: current.status,
    nextStatus: updated.status,
  });

  if (updated.status === SubmissionStatus.SUBMITTED) {
    const emailResult = await sendSubmissionReceivedEmail(
      updated.user.email,
      updated.title,
      updated.user.displayName,
    );

    captureMessage(
      'Submission received email flow completed.',
      emailResult.ok ? 'info' : 'warning',
      {
        submissionId: updated.id,
        result: emailResult.ok ? 'sent' : emailResult.skipped ? 'skipped' : 'failed',
        reason: emailResult.ok ? null : emailResult.reason,
      },
    );
  } else {
    const emailResult = await sendSubmissionStatusChangedEmail(
      updated.user.email,
      updated.title,
      updated.status,
      updated.user.displayName,
    );

    captureMessage(
      'Submission status email flow completed.',
      emailResult.ok ? 'info' : 'warning',
      {
        submissionId: updated.id,
        previousStatus: current.status,
        nextStatus: updated.status,
        result: emailResult.ok ? 'sent' : emailResult.skipped ? 'skipped' : 'failed',
        reason: emailResult.ok ? null : emailResult.reason,
      },
    );
  }

  return updated;
}

export async function listAdminDashboardMetrics() {
  const [seasonCount, stageCount, episodeCount, submissionCount, creatorCount] = await Promise.all([
    prisma.season.count(),
    prisma.stage.count(),
    prisma.episode.count(),
    prisma.submission.count(),
    prisma.creatorProfile.count(),
  ]);

  return { seasonCount, stageCount, episodeCount, submissionCount, creatorCount };
}

export async function listAdminSeasons() {
  return prisma.season.findMany({ orderBy: [{ createdAt: "desc" }] });
}

export async function listAdminStages() {
  return prisma.stage.findMany({
    include: {
      season: true,
      episodes: true,
      _count: { select: { episodes: true } },
    },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function listAdminEpisodes() {
  return prisma.episode.findMany({
    include: {
      season: true,
      stage: true,
      performances: true,
    },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function listAdminSubmissionQueue() {
  return prisma.submission.findMany({
    where: {
      status: {
        in: [SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW],
      },
    },
    include: {
      user: true,
      videoAsset: true,
      judgeResults: {
        include: { judge: true },
      },
    },
    orderBy: [{ submittedAt: "asc" }, { createdAt: "asc" }],
  });
}

export async function listAdminRecentSubmissions() {
  return prisma.submission.findMany({
    include: {
      user: true,
      videoAsset: true,
      judgeResults: {
        include: { judge: true },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 12,
  });
}
