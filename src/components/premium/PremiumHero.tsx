import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type PremiumHeroTone = "lobby" | "show" | "auditions" | "results" | "profile" | "archive";

const toneSurfaces: Record<
  PremiumHeroTone,
  string
> = {
  lobby:
    "from-[#12121a] via-[#08080d] to-[#050508] [--hero-glow:rgba(140,140,220,0.14)]",
  show:
    "from-[#101018] via-[#070711] to-[#050508] [--hero-glow:rgba(180,160,255,0.12)]",
  auditions:
    "from-[#111014] via-[#08070a] to-[#050508] [--hero-glow:rgba(220,200,160,0.10)]",
  results:
    "from-[#0e1218] via-[#07090e] to-[#050508] [--hero-glow:rgba(160,190,230,0.14)]",
  profile:
    "from-[#101016] via-[#08080c] to-[#050508] [--hero-glow:rgba(200,200,210,0.11)]",
  archive:
    "from-[#121014] via-[#09080a] to-[#050508] [--hero-glow:rgba(170,150,140,0.09)]",
};

/** Full-bleed cinematic hero — streaming lobby framing (asynchronous, not broadcast UI). */
export function PremiumHero(props: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  artwork?: ReactNode;
  tone?: PremiumHeroTone;
  className?: string;
}) {
  const tone = props.tone ?? "lobby";

  return (
    <section
      className={cn(
        "foundation-animated-enter member-bleed relative mb-2 overflow-hidden border border-white/[0.08] bg-gradient-to-b shadow-[0_32px_100px_-48px_rgba(0,0,0,0.92)]",
        toneSurfaces[tone],
        props.className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_25%,var(--hero-glow),transparent_60%)] opacity-90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-1/4 top-1/2 h-[120%] w-[70%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_65%)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#050508] via-[#050508]/80 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(circle_at_70%_40%,rgba(255,255,255,0.09),transparent_30%),radial-gradient(circle_at_80%_35%,rgba(255,255,255,0.03),transparent_48%)]"
        aria-hidden
      />
      <div className="relative mx-auto grid min-h-[16.5rem] max-w-5xl gap-5 px-4 pb-6 pt-[4.25rem] sm:min-h-[22rem] sm:px-8 sm:pb-9 sm:pt-[5.5rem] lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end lg:px-14">
        <div className="flex flex-col justify-end">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f06b55]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground/58">
              {props.eyebrow}
            </p>
          </div>
          <h1 className="mt-3 max-w-2xl text-balance text-[1.6rem] font-semibold tracking-[-0.035em] text-foreground sm:text-[2.35rem] lg:text-[2.7rem] lg:leading-[1.02]">
            {props.title}
          </h1>
          {props.subtitle ? (
            <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-foreground/64 sm:text-[14px]">
              {props.subtitle}
            </p>
          ) : null}
          {props.actions ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {props.actions}
            </div>
          ) : null}
          {props.meta ? <div className="foundation-hero-meta">{props.meta}</div> : null}
          <div className="mt-5 flex items-center gap-2">
            <span className="h-1.5 w-4 rounded-full bg-white" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/28" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/28" />
          </div>
        </div>
        {props.artwork ? <div className="hidden lg:block">{props.artwork}</div> : null}
      </div>
    </section>
  );
}
