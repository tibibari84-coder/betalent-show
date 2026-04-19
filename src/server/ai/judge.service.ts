import type { Prisma } from "@prisma/client";

import type { JudgeMeta } from "@/server/ai/types";
import { prisma } from "@/server/db/prisma";

import { createAiOutput } from "./ai-output.service";
import { completeChatJson } from "./openai";

export const PROMPT_VERSION_JUDGE = "betajudge-v1";

function parseJudgePayload(raw: string): {
  summary: string;
  meta: JudgeMeta;
  title: string | null;
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Judge response was not valid JSON.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Judge response JSON shape invalid.");
  }

  const obj = parsed as Record<string, unknown>;
  const summary =
    typeof obj.summary === "string"
      ? obj.summary.trim()
      : typeof obj.critique === "string"
        ? obj.critique.trim()
        : "";

  const takeaway =
    typeof obj.takeaway === "string" ? obj.takeaway.trim() : "";

  const strengths = Array.isArray(obj.strengths)
    ? obj.strengths.filter((s): s is string => typeof s === "string")
    : [];
  const weaknesses = Array.isArray(obj.weaknesses)
    ? obj.weaknesses.filter((s): s is string => typeof s === "string")
    : [];

  const meta: JudgeMeta = {
    strengths,
    weaknesses,
    takeaway,
  };

  const title =
    typeof obj.title === "string" && obj.title.trim()
      ? obj.title.trim()
      : null;

  const body =
    summary ||
    [takeaway, ...strengths.map((s) => `Strength: ${s}`)].join("\n\n");

  if (!body) {
    throw new Error("Judge JSON missing narrative content.");
  }

  return { summary: body, meta, title };
}

/**
 * Generates a performance-level judge critique from stored BETALENT fields only.
 * Does not assign scores or official placement.
 */
export async function generateJudgeForPerformance(
  performanceId: string,
): Promise<{ id: string }> {
  const p = await prisma.performance.findUnique({
    where: { id: performanceId },
    include: {
      contestant: { select: { displayName: true, username: true } },
      season: { select: { title: true, slug: true } },
      stage: { select: { title: true, slug: true, status: true } },
      episode: { select: { title: true, slug: true } },
    },
  });

  if (!p) {
    throw new Error("Performance not found.");
  }

  const contextLines = [
    `Performance title: ${p.title}`,
    p.description?.trim()
      ? `Artist description (user-provided): ${p.description.trim()}`
      : null,
    `Performance kind (official enum): ${p.performanceType}`,
    `Performance lifecycle status (official enum): ${p.status}`,
    `Contestant display name: ${p.contestant.displayName}`,
    `Contestant handle: @${p.contestant.username}`,
    `Season: ${p.season.title}`,
    p.stage
      ? `Stage: ${p.stage.title} (stage status: ${p.stage.status})`
      : "Stage: not linked",
    p.episode ? `Episode: ${p.episode.title}` : "Episode: not linked",
    p.mediaRef ? `Temporary media ref (opaque): ${p.mediaRef}` : null,
  ].filter(Boolean);

  const system = [
    "You are writing interpretive BETALENT judge commentary for an internal audience.",
    "BETALENT must stay premium, restrained, cinematic — never cheesy hype or fake-live broadcast language.",
    "You only reflect information provided below. Do not invent placements, votes, winners, advancement, scores, audience size, or unpublished facts.",
    "Official competition outcomes live in BETALENT database records — not in this text.",
    "Respond with JSON only (no markdown fences) matching keys: title (optional short headline), summary (one cohesive critique paragraph), strengths (array of short strings), weaknesses (array of short strings), takeaway (one refined closing line).",
  ].join(" ");

  const user = [
    "Ground-truth fields from BETALENT:",
    ...contextLines.map((l) => `- ${l}`),
  ].join("\n");

  const rawJson = await completeChatJson({ system, user });
  const parsed = parseJudgePayload(rawJson);

  return createAiOutput({
    kind: "JUDGE",
    targetType: "PERFORMANCE",
    ids: { performanceId },
    status: "GENERATED",
    promptVersion: PROMPT_VERSION_JUDGE,
    title: parsed.title,
    body: parsed.summary,
    metaJson: parsed.meta as unknown as Prisma.JsonObject,
    generatedAt: new Date(),
  });
}
