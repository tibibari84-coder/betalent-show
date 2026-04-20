import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import type { PublicEditorialPlacement } from "@/server/editorial/types";

/**
 * Curated presentation only — official competition truth appears elsewhere on the page.
 */
export function EditorialCallout(props: {
  placement: PublicEditorialPlacement | null;
  variant: "hero" | "spotlight";
  className?: string;
}) {
  const { placement, variant } = props;
  if (!placement) {
    return null;
  }

  const emphasis =
    variant === "hero"
      ? "text-xl font-semibold tracking-tight"
      : "text-base font-semibold tracking-tight";

  return (
    <aside
      className={cn(
        "flex h-full min-h-[8.5rem] flex-col gap-2 rounded-[1.35rem] border border-foreground/12 bg-gradient-to-b from-foreground/[0.06] to-foreground/[0.02] p-5 shadow-[0_8px_32px_-14px_rgba(0,0,0,0.5)] sm:min-h-[9rem] sm:p-6",
        props.className,
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-foreground/45">
        BETALENT curated · presentation layer · not an official competition
        outcome
      </p>
      <p className={emphasis + " text-foreground"}>
        {placement.headline?.trim() || placement.slotTitle}
      </p>
      {placement.subheadline?.trim() ? (
        <p className="text-sm leading-relaxed text-foreground/70">
          {placement.subheadline}
        </p>
      ) : null}
      {placement.contextLabel ? (
        <p className="text-xs text-foreground/55">
          Spotlight: {placement.contextLabel}
        </p>
      ) : null}
      {placement.ctaLabel?.trim() && placement.ctaHref ? (
        <Link
          href={placement.ctaHref}
          className="inline-flex h-10 w-fit items-center justify-center rounded-xl border border-foreground/20 px-4 text-sm font-medium text-foreground transition hover:bg-foreground/5"
        >
          {placement.ctaLabel}
        </Link>
      ) : null}
    </aside>
  );
}
