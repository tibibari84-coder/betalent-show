import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type FeatureTone = "lobby" | "cobalt" | "gold" | "violet" | "emerald" | "ember";

const toneClasses: Record<FeatureTone, string> = {
  lobby: "from-[#17181f] via-[#0d0e13] to-[#060607] [--feature-glow:rgba(255,255,255,0.08)]",
  cobalt: "from-[#142236] via-[#0b1018] to-[#060607] [--feature-glow:rgba(98,145,255,0.22)]",
  gold: "from-[#2b220f] via-[#15120b] to-[#060607] [--feature-glow:rgba(255,214,102,0.18)]",
  violet: "from-[#22162e] via-[#120d18] to-[#060607] [--feature-glow:rgba(180,120,255,0.18)]",
  emerald: "from-[#12241d] via-[#0d1411] to-[#060607] [--feature-glow:rgba(99,214,151,0.18)]",
  ember: "from-[#321612] via-[#180d0b] to-[#060607] [--feature-glow:rgba(240,107,85,0.2)]",
};

export function FeatureSurface(props: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  meta?: ReactNode;
  media?: ReactNode;
  tone?: FeatureTone;
  className?: string;
}) {
  const tone = props.tone ?? "lobby";

  return (
    <section
      className={cn(
        "foundation-animated-enter relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-b shadow-[0_36px_90px_-46px_rgba(0,0,0,0.96)]",
        toneClasses[tone],
        props.className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_8%,var(--feature-glow),transparent_62%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#050508] via-[#050508]/84 to-transparent"
        aria-hidden
      />
      <div className="relative grid gap-6 px-5 pb-6 pt-6 sm:px-7 sm:pb-7 sm:pt-7 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-end">
        <div className="flex min-h-[18rem] flex-col justify-end">
          {props.eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">
              {props.eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 max-w-[14ch] text-balance text-[2rem] font-semibold tracking-[-0.06em] text-white sm:text-[2.6rem]">
            {props.title}
          </h1>
          {props.description ? (
            <p className="mt-3 max-w-[28rem] text-[15px] leading-relaxed text-white/68">
              {props.description}
            </p>
          ) : null}
          {(props.primaryAction || props.secondaryAction) ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {props.primaryAction}
              {props.secondaryAction}
            </div>
          ) : null}
          {props.meta ? <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/56">{props.meta}</div> : null}
        </div>
        {props.media ? <div className="hidden lg:block">{props.media}</div> : null}
      </div>
    </section>
  );
}
