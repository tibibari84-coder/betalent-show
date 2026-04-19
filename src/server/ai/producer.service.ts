import { prisma } from "@/server/db/prisma";

import { createAiOutput } from "./ai-output.service";
import { completeChatText } from "./openai";

export const PROMPT_VERSION_PRODUCER = "betaproducer-v1";

/**
 * Assistive editorial framing for a curated EditorialPlacement — does not replace placement truth.
 */
export async function generateProducerForEditorialPlacement(
  editorialPlacementId: string,
): Promise<{ id: string }> {
  const row = await prisma.editorialPlacement.findUnique({
    where: { id: editorialPlacementId },
    include: {
      editorialSlot: {
        select: { slotKey: true, title: true, pageScope: true },
      },
      season: { select: { title: true } },
      stage: { select: { title: true } },
      episode: { select: { title: true } },
      performance: { select: { title: true } },
      contestant: { select: { displayName: true } },
      stageResult: { select: { title: true } },
    },
  });

  if (!row) {
    throw new Error("Editorial placement not found.");
  }

  const lines = [
    `Slot: ${row.editorialSlot.slotKey} (${row.editorialSlot.pageScope})`,
    `Placement status (official editorial enum): ${row.status}`,
    `Target type: ${row.targetType}`,
    row.headline?.trim() ? `Existing headline (truth): ${row.headline.trim()}` : null,
    row.subheadline?.trim()
      ? `Existing subheadline (truth): ${row.subheadline.trim()}`
      : null,
    row.ctaLabel?.trim() ? `Existing CTA label (truth): ${row.ctaLabel.trim()}` : null,
    row.season ? `Season context: ${row.season.title}` : null,
    row.stage ? `Stage context: ${row.stage.title}` : null,
    row.episode ? `Episode context: ${row.episode.title}` : null,
    row.performance ? `Performance context: ${row.performance.title}` : null,
    row.contestant ? `Contestant context: ${row.contestant.displayName}` : null,
    row.stageResult ? `Stage result package title: ${row.stageResult.title}` : null,
  ].filter(Boolean);

  const system = [
    "You assist BETALENT editorial producers with optional premium headline/subhead/support copy.",
    "The structured fields listed as 'truth' were authored by show-runners — do not contradict them.",
    "Never invent competition outcomes, placements, or advancement.",
    "Output plain text with three sections separated by blank lines:",
    "LINE 1: headline suggestion (short)",
    "LINE 2: subheadline suggestion",
    "Following lines: supporting copy (2–4 sentences, restrained).",
    "Do not prefix section labels.",
  ].join(" ");

  const raw = await completeChatText({
    system,
    user: lines.join("\n"),
  });

  const blocks = raw.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const headline = blocks[0] ?? raw.slice(0, 120);
  const subhead = blocks[1] ?? "";
  const rest = blocks.slice(2).join("\n\n") || blocks.slice(1).join("\n\n");

  const title = headline.slice(0, 200);
  const body = [subhead, rest].filter(Boolean).join("\n\n").trim() || raw;

  return createAiOutput({
    kind: "PRODUCER",
    targetType: "EDITORIAL_PLACEMENT",
    ids: { editorialPlacementId },
    status: "GENERATED",
    promptVersion: PROMPT_VERSION_PRODUCER,
    title,
    body,
    generatedAt: new Date(),
  });
}
