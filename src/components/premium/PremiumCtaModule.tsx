import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type PremiumCtaTone = "ember" | "cobalt" | "gold" | "violet" | "emerald";

export function PremiumCtaModule(props: {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  action: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
  tone?: PremiumCtaTone;
}) {
  return (
    <section
      className={cn(
        "foundation-panel foundation-cta-module p-4 sm:p-6",
        props.tone ? `foundation-tint-${props.tone}` : "foundation-tint-violet",
        props.className,
      )}
    >
      <p className="foundation-kicker">{props.eyebrow}</p>
      <h2 className="mt-3 text-[1.35rem] font-semibold text-white sm:text-2xl">{props.title}</h2>
      <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-white/62 sm:text-sm">
        {props.description}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        {props.action}
        {props.secondaryAction}
      </div>
    </section>
  );
}
