import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type PremiumStageCardTheme =
  | "ember"
  | "cobalt"
  | "gold"
  | "violet"
  | "emerald";

const themeClasses: Record<PremiumStageCardTheme, string> = {
  ember:
    "from-[#2d140f] via-[#140d0b] to-[#09090b] [--stage-glow:rgba(240,107,85,0.22)]",
  cobalt:
    "from-[#111d32] via-[#0b1018] to-[#09090b] [--stage-glow:rgba(98,145,255,0.24)]",
  gold:
    "from-[#2a2009] via-[#15120b] to-[#09090b] [--stage-glow:rgba(255,214,102,0.2)]",
  violet:
    "from-[#1f152b] via-[#120d18] to-[#09090b] [--stage-glow:rgba(180,120,255,0.2)]",
  emerald:
    "from-[#12211a] via-[#0d1411] to-[#09090b] [--stage-glow:rgba(99,214,151,0.18)]",
};

export function PremiumStageCard(props: {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  meta?: ReactNode;
  href?: string;
  imageUrl?: string | null;
  theme?: PremiumStageCardTheme;
  className?: string;
}) {
  const theme = props.theme ?? "ember";
  const style: CSSProperties | undefined = props.imageUrl
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(4,4,6,0.04), rgba(4,4,6,0.88) 72%), url(${props.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  const content = (
    <div
      className={cn(
        "foundation-stage-card relative flex min-h-[12.5rem] snap-start flex-col justify-end overflow-hidden rounded-[1.35rem] border border-white/10 bg-gradient-to-b p-4 shadow-[0_28px_70px_-38px_rgba(0,0,0,0.92)]",
        !props.imageUrl && themeClasses[theme],
        props.className,
      )}
      style={style}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,var(--stage-glow),transparent_62%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#070709] via-[#070709]/72 to-transparent"
        aria-hidden
      />
      <div className="relative flex flex-col gap-2">
        {props.eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/58">
            {props.eyebrow}
          </p>
        ) : null}
        <h3 className="max-w-[16rem] text-[1.15rem] font-semibold tracking-[-0.03em] text-white">
          {props.title}
        </h3>
        {props.subtitle ? (
          <p className="max-w-[16rem] text-[13px] leading-relaxed text-white/68">
            {props.subtitle}
          </p>
        ) : null}
        {props.meta ? (
          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-white/56">
            {props.meta}
          </div>
        ) : null}
      </div>
    </div>
  );

  if (props.href) {
    return <Link href={props.href} className="block focus-visible:outline-none">{content}</Link>;
  }

  return content;
}
