import type {
  AIOutputKind,
  AIOutputStatus,
  AIOutputTargetType,
} from "@prisma/client";

/** Structured extras for AI Judge outputs (stored in metaJson). */
export type JudgeMeta = {
  strengths: string[];
  weaknesses: string[];
  takeaway: string;
};

/** Safe read model for member surfaces — never implies official outcomes. */
export type PublicAiOutput = {
  id: string;
  kind: AIOutputKind;
  targetType: AIOutputTargetType;
  title: string | null;
  body: string;
  metaJson: JudgeMeta | null;
  status: AIOutputStatus;
};
