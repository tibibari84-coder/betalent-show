import type {
  EditorialPageScope,
  EditorialPlacementStatus,
  EditorialTargetType,
} from "@prisma/client";

/** Safe DTO for member surfaces — editorial framing only, not official results. */
export type PublicEditorialPlacement = {
  placementId: string;
  slotKey: string;
  slotTitle: string;
  pageScope: EditorialPageScope;
  targetType: EditorialTargetType;
  headline: string | null;
  subheadline: string | null;
  ctaLabel: string | null;
  /** Shallow link for CTA — derived from target, not competition logic. */
  ctaHref: string | null;
  /** Short label from the linked official entity (title/name). */
  contextLabel: string | null;
  publishedAt: Date;
  status: EditorialPlacementStatus;
};
