import type { EditorialPageScope, EditorialPlacement } from "@prisma/client";

import { appRoutes } from "@/lib/app-routes";
import { prisma } from "@/server/db/prisma";

import type { PublicEditorialPlacement } from "./types";

const placementInclude = {
  editorialSlot: true,
  season: { select: { title: true } },
  stage: { select: { title: true } },
  episode: { select: { title: true } },
  performance: { select: { title: true } },
  contestant: { select: { displayName: true } },
  stageResult: { select: { title: true } },
} as const;

type PlacementWithRelations = EditorialPlacement & {
  editorialSlot: {
    slotKey: string;
    title: string;
    pageScope: EditorialPageScope;
  };
  season: { title: string } | null;
  stage: { title: string } | null;
  episode: { title: string } | null;
  performance: { title: string } | null;
  contestant: { displayName: string } | null;
  stageResult: { title: string } | null;
};

function contextLabelFromPlacement(row: PlacementWithRelations): string | null {
  switch (row.targetType) {
    case "SEASON":
      return row.season?.title ?? null;
    case "STAGE":
      return row.stage?.title ?? null;
    case "EPISODE":
      return row.episode?.title ?? null;
    case "PERFORMANCE":
      return row.performance?.title ?? null;
    case "CONTESTANT":
      return row.contestant?.displayName ?? null;
    case "STAGE_RESULT":
      return row.stageResult?.title ?? null;
    default:
      return null;
  }
}

/** Presentation-only navigation hints — not official routing rules. */
function ctaHrefFromPlacement(row: EditorialPlacement): string | null {
  switch (row.targetType) {
    case "SEASON":
    case "STAGE":
    case "EPISODE":
    case "PERFORMANCE":
    case "STAGE_RESULT":
      return appRoutes.seasons;
    case "CONTESTANT":
      return null;
    default:
      return null;
  }
}

function toPublicDto(row: PlacementWithRelations): PublicEditorialPlacement {
  const publishedAt = row.publishedAt ?? row.updatedAt;

  return {
    placementId: row.id,
    slotKey: row.editorialSlot.slotKey,
    slotTitle: row.editorialSlot.title,
    pageScope: row.editorialSlot.pageScope,
    targetType: row.targetType,
    headline: row.headline,
    subheadline: row.subheadline,
    ctaLabel: row.ctaLabel,
    ctaHref: ctaHrefFromPlacement(row),
    contextLabel: contextLabelFromPlacement(row),
    publishedAt,
    status: row.status,
  };
}

/** Latest published editorial row for an active slot — never draft/internal prep. */
export async function getPublishedPlacementForSlotKey(
  slotKey: string,
): Promise<PublicEditorialPlacement | null> {
  const slot = await prisma.editorialSlot.findUnique({
    where: { slotKey },
  });

  if (!slot || slot.status !== "ACTIVE") {
    return null;
  }

  const row = await prisma.editorialPlacement.findFirst({
    where: {
      editorialSlotId: slot.id,
      status: "PUBLISHED",
    },
    orderBy: { publishedAt: "desc" },
    include: placementInclude,
  });

  if (!row?.publishedAt) {
    return null;
  }

  return toPublicDto(row);
}

export async function getPublishedPlacementsForPageScope(
  pageScope: EditorialPageScope,
): Promise<PublicEditorialPlacement[]> {
  const slots = await prisma.editorialSlot.findMany({
    where: { pageScope, status: "ACTIVE" },
    orderBy: { slotKey: "asc" },
  });

  const out: PublicEditorialPlacement[] = [];

  for (const slot of slots) {
    const row = await prisma.editorialPlacement.findFirst({
      where: {
        editorialSlotId: slot.id,
        status: "PUBLISHED",
      },
      orderBy: { publishedAt: "desc" },
      include: placementInclude,
    });

    if (row?.publishedAt) {
      out.push(toPublicDto(row));
    }
  }

  return out;
}
