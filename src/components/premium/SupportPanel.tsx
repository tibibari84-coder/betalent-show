import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type SupportTone = "neutral" | "cobalt" | "gold" | "violet" | "emerald" | "ember";

const toneClasses: Record<SupportTone, string> = {
  neutral: "foundation-tint-cobalt",
  cobalt: "foundation-tint-cobalt",
  gold: "foundation-tint-gold",
  violet: "foundation-tint-violet",
  emerald: "foundation-tint-emerald",
  ember: "foundation-tint-ember",
};

export function SupportPanel(props: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  aside?: ReactNode;
  tone?: SupportTone;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "foundation-panel relative rounded-[1.75rem] p-5 sm:p-6",
        toneClasses[props.tone ?? "neutral"],
        props.className,
      )}
    >
      <div className="relative flex h-full flex-col gap-4">
        {props.eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
            {props.eyebrow}
          </p>
        ) : null}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-[1.3rem] font-semibold tracking-[-0.04em] text-white sm:text-[1.55rem]">
              {props.title}
            </h2>
            {props.description ? (
              <p className="mt-2 max-w-[34rem] text-[14px] leading-relaxed text-white/64">
                {props.description}
              </p>
            ) : null}
          </div>
          {props.aside ? <div className="shrink-0">{props.aside}</div> : null}
        </div>
        {props.action ? <div className="pt-1">{props.action}</div> : null}
      </div>
    </section>
  );
}
