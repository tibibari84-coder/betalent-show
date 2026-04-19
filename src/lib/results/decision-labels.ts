import type { AdvancementDecisionKind } from "@prisma/client";

export const ADVANCEMENT_DECISION_LABEL: Record<
  AdvancementDecisionKind,
  string
> = {
  ADVANCED: "Advanced",
  ELIMINATED: "Eliminated",
  HOLD: "On hold",
  PENDING: "Pending",
  WINNER: "Winner",
  RUNNER_UP: "Runner-up",
  WILDCARD: "Wildcard",
};
