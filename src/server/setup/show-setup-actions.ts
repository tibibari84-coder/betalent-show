"use server";

import { revalidatePath } from "next/cache";

import type {
  AuditionWindowStatus,
  EpisodeStatus,
  SeasonStatus,
  StageStatus,
  StageType,
} from "@prisma/client";

import { getSession } from "@/server/auth/session";
import {
  isAuditionReviewerEmail,
  parseAuditionReviewerEmailAllowlist,
} from "@/server/auditions/reviewer.guard";
import {
  missingOperatorAllowlistMessage,
  notAuthorizedOperatorMessage,
} from "@/server/internal/access-copy";

import {
  createAuditionWindowRecord,
  createEpisodeRecord,
  createSeasonRecord,
  createStageRecord,
} from "./show-setup.service";

export type ShowSetupActionState = {
  error?: string;
  ok?: boolean;
  detail?: string;
};

async function gateOperator(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session?.user.onboardingCompletedAt) {
    return { ok: false, error: "Sign in to continue." };
  }
  if (parseAuditionReviewerEmailAllowlist().size === 0) {
    return { ok: false, error: missingOperatorAllowlistMessage() };
  }
  if (!isAuditionReviewerEmail(session.user.email)) {
    return { ok: false, error: notAuthorizedOperatorMessage() };
  }
  return { ok: true };
}

function slugifySafe(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseOptionalDate(raw: string): Date | null {
  const s = raw.trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseRequiredDate(raw: string, label: string): Date {
  const d = parseOptionalDate(raw);
  if (!d) {
    throw new Error(`${label} is required or invalid.`);
  }
  return d;
}

function parseOptionalInt(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  if (Number.isNaN(n)) return null;
  return n;
}

const SEASON_STATUSES: SeasonStatus[] = [
  "DRAFT",
  "UPCOMING",
  "LIVE",
  "COMPLETED",
  "ARCHIVED",
];

const STAGE_STATUSES: StageStatus[] = [
  "DRAFT",
  "UPCOMING",
  "OPEN",
  "JUDGING",
  "VOTING",
  "RESULTS",
  "COMPLETED",
  "ARCHIVED",
];

const STAGE_TYPES: StageType[] = [
  "AUDITION",
  "CALLBACK",
  "SEMIFINAL",
  "FINAL",
  "SPECIAL",
];

const WINDOW_STATUSES: AuditionWindowStatus[] = [
  "DRAFT",
  "UPCOMING",
  "OPEN",
  "CLOSED",
  "REVIEW",
  "COMPLETED",
  "ARCHIVED",
];

const EPISODE_STATUSES: EpisodeStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
];

function parseEnum<T extends string>(raw: string, allowed: readonly T[]): T {
  const v = raw.trim() as T;
  if (!allowed.includes(v)) {
    throw new Error("Invalid enum value.");
  }
  return v;
}

export async function createSeasonSetupAction(
  _prev: ShowSetupActionState | undefined,
  formData: FormData,
): Promise<ShowSetupActionState> {
  const gate = await gateOperator();
  if (!gate.ok) {
    return { error: gate.error };
  }

  try {
    let slug = String(formData.get("slug") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const descriptionRaw = String(formData.get("description") ?? "").trim();
    const status = parseEnum(
      String(formData.get("status") ?? ""),
      SEASON_STATUSES,
    );
    const startAt = parseOptionalDate(String(formData.get("startAt") ?? ""));
    const endAt = parseOptionalDate(String(formData.get("endAt") ?? ""));

    if (!title) {
      return { error: "Title is required." };
    }
    if (!slug) {
      slug = slugifySafe(title);
    }
    if (!slug) {
      return { error: "Slug is required (or provide a title to derive from)." };
    }

    const row = await createSeasonRecord({
      slug,
      title,
      description: descriptionRaw || null,
      status,
      startAt,
      endAt,
    });

    revalidatePath("/app");
    revalidatePath("/app/show");
    revalidatePath("/app/auditions");
    revalidatePath("/internal/show/setup");

    return {
      ok: true,
      detail: `Season created: ${row.title} (${row.slug}) · id ${row.id}`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not create season.";
    return { error: msg };
  }
}

export async function createStageSetupAction(
  _prev: ShowSetupActionState | undefined,
  formData: FormData,
): Promise<ShowSetupActionState> {
  const gate = await gateOperator();
  if (!gate.ok) {
    return { error: gate.error };
  }

  try {
    const seasonId = String(formData.get("seasonId") ?? "").trim();
    let slug = String(formData.get("slug") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const descriptionRaw = String(formData.get("description") ?? "").trim();
    const orderIndexRaw = String(formData.get("orderIndex") ?? "").trim();
    const stageType = parseEnum(
      String(formData.get("stageType") ?? ""),
      STAGE_TYPES,
    );
    const status = parseEnum(
      String(formData.get("status") ?? ""),
      STAGE_STATUSES,
    );

    const submissionsOpenAt = parseOptionalDate(
      String(formData.get("submissionsOpenAt") ?? ""),
    );
    const submissionsCloseAt = parseOptionalDate(
      String(formData.get("submissionsCloseAt") ?? ""),
    );
    const judgingOpenAt = parseOptionalDate(
      String(formData.get("judgingOpenAt") ?? ""),
    );
    const judgingCloseAt = parseOptionalDate(
      String(formData.get("judgingCloseAt") ?? ""),
    );
    const votingOpenAt = parseOptionalDate(
      String(formData.get("votingOpenAt") ?? ""),
    );
    const votingCloseAt = parseOptionalDate(
      String(formData.get("votingCloseAt") ?? ""),
    );
    const resultsAt = parseOptionalDate(String(formData.get("resultsAt") ?? ""));

    if (!seasonId) {
      return { error: "Season is required." };
    }
    if (!title) {
      return { error: "Title is required." };
    }
    if (!slug) {
      slug = slugifySafe(title);
    }
    if (!slug) {
      return { error: "Slug is required." };
    }

    const orderIndex =
      orderIndexRaw === ""
        ? 0
        : Number.parseInt(orderIndexRaw, 10);
    if (Number.isNaN(orderIndex)) {
      return { error: "orderIndex must be a number." };
    }

    const row = await createStageRecord({
      seasonId,
      slug,
      title,
      description: descriptionRaw || null,
      orderIndex,
      stageType,
      status,
      submissionsOpenAt,
      submissionsCloseAt,
      judgingOpenAt,
      judgingCloseAt,
      votingOpenAt,
      votingCloseAt,
      resultsAt,
    });

    revalidatePath("/app");
    revalidatePath("/app/show");
    revalidatePath("/app/auditions");
    revalidatePath("/internal/show/setup");

    return {
      ok: true,
      detail: `Stage created: ${row.title} (${row.slug}) · id ${row.id}`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not create stage.";
    return { error: msg };
  }
}

export async function createAuditionWindowSetupAction(
  _prev: ShowSetupActionState | undefined,
  formData: FormData,
): Promise<ShowSetupActionState> {
  const gate = await gateOperator();
  if (!gate.ok) {
    return { error: gate.error };
  }

  try {
    const seasonIdRaw = String(formData.get("seasonId") ?? "").trim();
    const stageIdRaw = String(formData.get("stageId") ?? "").trim();
    let slug = String(formData.get("slug") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const descriptionRaw = String(formData.get("description") ?? "").trim();
    const status = parseEnum(
      String(formData.get("status") ?? ""),
      WINDOW_STATUSES,
    );
    const opensAt = parseRequiredDate(
      String(formData.get("opensAt") ?? ""),
      "opensAt",
    );
    const closesAt = parseRequiredDate(
      String(formData.get("closesAt") ?? ""),
      "closesAt",
    );
    const reviewStartsAt = parseOptionalDate(
      String(formData.get("reviewStartsAt") ?? ""),
    );
    const reviewEndsAt = parseOptionalDate(
      String(formData.get("reviewEndsAt") ?? ""),
    );
    const maxRaw = String(formData.get("maxSubmissionsPerUser") ?? "");
    const maxSubmissionsPerUser = parseOptionalInt(maxRaw);

    const seasonId = seasonIdRaw || null;
    const stageId = stageIdRaw || null;

    if (!title) {
      return { error: "Title is required." };
    }
    if (!slug) {
      slug = slugifySafe(title);
    }
    if (!slug) {
      return { error: "Slug is required." };
    }

    const row = await createAuditionWindowRecord({
      seasonId,
      stageId,
      slug,
      title,
      description: descriptionRaw || null,
      status,
      opensAt,
      closesAt,
      reviewStartsAt,
      reviewEndsAt,
      maxSubmissionsPerUser,
    });

    revalidatePath("/app");
    revalidatePath("/app/show");
    revalidatePath("/app/auditions");
    revalidatePath("/internal/show/setup");

    return {
      ok: true,
      detail: `Audition window created: ${row.title} (${row.slug}) · id ${row.id}`,
    };
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Could not create audition window.";
    return { error: msg };
  }
}

export async function createEpisodeSetupAction(
  _prev: ShowSetupActionState | undefined,
  formData: FormData,
): Promise<ShowSetupActionState> {
  const gate = await gateOperator();
  if (!gate.ok) {
    return { error: gate.error };
  }

  try {
    const seasonId = String(formData.get("seasonId") ?? "").trim();
    const stageIdRaw = String(formData.get("stageId") ?? "").trim();
    let slug = String(formData.get("slug") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const descriptionRaw = String(formData.get("description") ?? "").trim();
    const orderIndexRaw = String(formData.get("orderIndex") ?? "").trim();
    const status = parseEnum(
      String(formData.get("status") ?? ""),
      EPISODE_STATUSES,
    );
    const premiereAt = parseOptionalDate(
      String(formData.get("premiereAt") ?? ""),
    );
    const publishedAt = parseOptionalDate(
      String(formData.get("publishedAt") ?? ""),
    );

    const stageId = stageIdRaw || null;

    if (!seasonId) {
      return { error: "Season is required." };
    }
    if (!title) {
      return { error: "Title is required." };
    }
    if (!slug) {
      slug = slugifySafe(title);
    }
    if (!slug) {
      return { error: "Slug is required." };
    }

    const orderIndex =
      orderIndexRaw === "" ? 0 : Number.parseInt(orderIndexRaw, 10);
    if (Number.isNaN(orderIndex)) {
      return { error: "orderIndex must be a number." };
    }

    const row = await createEpisodeRecord({
      seasonId,
      stageId,
      slug,
      title,
      description: descriptionRaw || null,
      orderIndex,
      status,
      premiereAt,
      publishedAt,
    });

    revalidatePath("/app");
    revalidatePath("/app/show");
    revalidatePath("/internal/show/setup");

    return {
      ok: true,
      detail: `Episode created: ${row.title} (${row.slug}) · id ${row.id}`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not create episode.";
    return { error: msg };
  }
}
