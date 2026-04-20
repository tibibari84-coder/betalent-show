import { cn } from "@/lib/utils/cn";

/** Catalog-style performance tile — artwork is abstract when no media exists. */
export function PerformancePosterCard(props: {
  title: string;
  meta: string;
  footnote?: string;
  /** Deterministic tint from server id — visual only, not fake content. */
  accentSeed?: string;
  className?: string;
}) {
  const hue =
    props.accentSeed != null
      ? Math.abs(
          [...props.accentSeed].reduce((acc, c) => acc + c.charCodeAt(0), 0),
        ) % 360
      : 220;

  return (
    <article
      className={cn(
        "relative flex aspect-[16/11] w-[min(82vw,22rem)] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-2xl border border-white/[0.09] shadow-[0_20px_50px_-24px_rgba(0,0,0,0.85)] sm:w-[22rem]",
        props.className,
      )}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/55 to-black/90"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 30% 15%, hsla(${hue}, 42%, 52%, 0.35), transparent 52%),
            radial-gradient(ellipse 70% 55% at 85% 35%, hsla(${(hue + 40) % 360}, 38%, 45%, 0.22), transparent 48%),
            linear-gradient(165deg, hsla(${hue}, 25%, 14%, 0.95), hsl(230, 12%, 6%) 65%)
          `,
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_35%,rgba(0,0,0,0.92))]" />
      <div className="relative px-4 pb-4 pt-12 sm:px-5 sm:pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
          BETALENT · performance
        </p>
        <p className="mt-2 line-clamp-2 text-base font-semibold tracking-tight text-white">
          {props.title}
        </p>
        <p className="mt-1 text-xs text-white/72">{props.meta}</p>
        {props.footnote ? (
          <p className="mt-2 line-clamp-2 text-[11px] text-white/48">
            {props.footnote}
          </p>
        ) : null}
      </div>
    </article>
  );
}
