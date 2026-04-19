import { prisma } from "@/server/db/prisma";

import { createAiOutput } from "./ai-output.service";
import { completeChatText } from "./openai";

export const PROMPT_VERSION_HOST = "betahost-v1";

function stageIntent(mode: "intro" | "recap" | "results_frame"): string {
  switch (mode) {
    case "intro":
      return "Write a restrained show-style intro framing this stage — no fake live countdowns or 'we are live' language.";
    case "recap":
      return "Write a concise recap framing — reflective, premium; do not imply live broadcasting.";
    case "results_frame":
      return "Write a short framing paragraph that introduces official results context — without inventing placements or winners.";
    default:
      return "";
  }
}

/** HOST copy anchored to a Stage. */
export async function generateHostForStage(input: {
  stageId: string;
  mode?: "intro" | "recap";
}): Promise<{ id: string }> {
  const mode = input.mode ?? "intro";

  const stage = await prisma.stage.findUnique({
    where: { id: input.stageId },
    include: {
      season: { select: { title: true, slug: true, status: true } },
    },
  });

  if (!stage) {
    throw new Error("Stage not found.");
  }

  const lines = [
    `Season: ${stage.season.title} (${stage.season.status})`,
    `Stage title: ${stage.title}`,
    stage.description?.trim()
      ? `Stage description: ${stage.description.trim()}`
      : null,
    `Stage type: ${stage.stageType}`,
    `Stage status: ${stage.status}`,
  ].filter(Boolean);

  const system = [
    "You write BETALENT host narration copy — interpretive presentation only.",
    "Never claim live broadcast, real-time voting numbers, winners, or placements unless explicitly provided below.",
    "Stay premium and cinematic; avoid shouty talent-show clichés.",
    stageIntent(mode),
  ].join(" ");

  const user = ["Facts:\n", ...lines.map((l) => `- ${l}`)].join("\n");

  const text = await completeChatText({ system, user });
  const title =
    mode === "intro"
      ? `${stage.title}`
      : `${stage.title} · reflection`;

  return createAiOutput({
    kind: "HOST",
    targetType: "STAGE",
    ids: { stageId: input.stageId },
    status: "GENERATED",
    promptVersion: PROMPT_VERSION_HOST,
    title,
    body: text,
    generatedAt: new Date(),
  });
}

/** HOST copy for a published StageResult package — presentational only. */
export async function generateHostForStageResult(stageResultId: string): Promise<{
  id: string;
}> {
  const row = await prisma.stageResult.findUnique({
    where: { id: stageResultId },
    include: {
      season: { select: { title: true } },
      stage: { select: { title: true } },
      entries: {
        orderBy: { placementOrder: "asc" },
        include: {
          contestant: { select: { displayName: true, username: true } },
          performance: { select: { title: true } },
        },
      },
    },
  });

  if (!row) {
    throw new Error("Stage result not found.");
  }

  const placementLines = row.entries.map((e) => {
    const who = `${e.contestant.displayName} (@${e.contestant.username})`;
    const perf = e.performance.title;
    const hl = e.highlightLabel?.trim()
      ? ` · highlight: ${e.highlightLabel.trim()}`
      : "";
    return `#${e.placementOrder} ${who} — ${perf}${hl}`;
  });

  const lines = [
    `Season: ${row.season.title}`,
    `Stage: ${row.stage.title}`,
    `Official result package title: ${row.title}`,
    row.summary?.trim() ? `Official summary text: ${row.summary.trim()}` : null,
    `Official package status: ${row.status}`,
    row.publishedAt
      ? `Published at (official): ${row.publishedAt.toISOString()}`
      : null,
    "Placement rows (official ordering):",
    ...placementLines.map((l) => `  ${l}`),
  ].filter(Boolean);

  const system = [
    "You write BETALENT host-style framing around an official published result package.",
    "Use only the facts listed — especially placement order and names — do not invent scores or alternate outcomes.",
    "Do not imply live broadcast. This is reflective presentation copy for the BETALENT web experience.",
    stageIntent("results_frame"),
  ].join(" ");

  const user = lines.join("\n");
  const text = await completeChatText({ system, user });

  return createAiOutput({
    kind: "HOST",
    targetType: "STAGE_RESULT",
    ids: { stageResultId },
    status: "GENERATED",
    promptVersion: PROMPT_VERSION_HOST,
    title: `${row.stage.title} · official results framing`,
    body: text,
    generatedAt: new Date(),
  });
}
