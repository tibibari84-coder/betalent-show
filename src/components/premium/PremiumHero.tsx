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
  tone?: PremiumHeroTone;
  className?: string;
}) {
  const tone = props.tone ?? "lobby";

  return (
    <section
      className={cn(
        "member-bleed relative mb-2 overflow-hidden bg-gradient-to-b",
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
      <div className="relative mx-auto flex min-h-[min(52vh,28rem)] max-w-5xl flex-col justify-end px-6 pb-12 pt-16 sm:min-h-[min(48vh,30rem)] sm:px-10 sm:pb-14 sm:pt-20 lg:px-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-foreground/50">
          {props.eyebrow}
        </p>
        <h1 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem] lg:leading-[1.1]">
          {props.title}
        </h1>
        {props.subtitle ? (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/68 sm:text-[15px]">
            {props.subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
