import Link from "next/link";

import type { PublicEditorialPlacement } from "@/server/editorial/types";

/**
 * Curated presentation only — official competition truth appears elsewhere on the page.
 */
export function EditorialCallout(props: {
  placement: PublicEditorialPlacement | null;
  variant: "hero" | "spotlight";
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
    <aside className="flex flex-col gap-2 rounded-2xl border border-foreground/15 bg-foreground/[0.04] p-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-foreground/45">
        BETALENT curated · not an official result
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
