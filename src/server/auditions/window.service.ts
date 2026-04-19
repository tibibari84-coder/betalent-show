import type { AuditionWindow } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

import type { AuditionWindowPublicView } from "./types";

/** Window is accepting entries by schedule (status OPEN + within opens/closes). */
export function isAuditionWindowScheduleOpen(
  window: Pick<AuditionWindow, "status" | "opensAt" | "closesAt">,
  now: Date = new Date(),
): boolean {
  if (window.status !== "OPEN") return false;
  const t = now.getTime();
  return (
    window.opensAt.getTime() <= t &&
    t <= window.closesAt.getTime()
  );
}

/** Window is in formal review period (optional dates; falls back to status REVIEW). */
export function isAuditionWindowInReviewPeriod(
  window: Pick<
    AuditionWindow,
    "status" | "reviewStartsAt" | "reviewEndsAt"
  >,
  now: Date = new Date(),
): boolean {
  if (window.status === "REVIEW") return true;
  const t = now.getTime();
  if (window.reviewStartsAt && window.reviewEndsAt) {
    return (
      window.reviewStartsAt.getTime() <= t &&
      t <= window.reviewEndsAt.getTime()
    );
  }
  return false;
}

export async function getAuditionWindowBySlug(
  slug: string,
): Promise<AuditionWindow | null> {
  return prisma.auditionWindow.findUnique({ where: { slug } });
}

/** Single source of truth for “current open” window: first OPEN window whose schedule includes `now`. */
export async function getPrimaryOpenAuditionWindow(
  now: Date = new Date(),
): Promise<AuditionWindow | null> {
  const rows = await prisma.auditionWindow.findMany({
    where: {
      status: "OPEN",
      opensAt: { lte: now },
      closesAt: { gte: now },
    },
    orderBy: { opensAt: "desc" },
    take: 1,
  });
  return rows[0] ?? null;
}

export function toAuditionWindowPublicView(
  window: AuditionWindow,
  now: Date = new Date(),
): AuditionWindowPublicView {
  const scheduleOpen = isAuditionWindowScheduleOpen(window, now);
  const reviewPeriod = isAuditionWindowInReviewPeriod(window, now);
  return {
    id: window.id,
    slug: window.slug,
    title: window.title,
    description: window.description,
    status: window.status,
    opensAt: window.opensAt,
    closesAt: window.closesAt,
    reviewStartsAt: window.reviewStartsAt,
    reviewEndsAt: window.reviewEndsAt,
    maxSubmissionsPerUser: window.maxSubmissionsPerUser,
    scheduleOpen,
    reviewPeriod,
  };
}
