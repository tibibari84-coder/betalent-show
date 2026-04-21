import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type StatusCardTone = "ember" | "cobalt" | "gold" | "violet" | "emerald";

export function StatusCard(props: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
  tone?: StatusCardTone;
}) {
  return (
    <section
      className={cn(
        "foundation-panel foundation-status-card p-4 sm:p-6",
        props.tone ? `foundation-tint-${props.tone}` : "foundation-tint-cobalt",
        props.className,
      )}
    >
      <p className="foundation-kicker">{props.eyebrow}</p>
      <h2 className="mt-3 text-[1.35rem] font-semibold text-white sm:text-2xl">{props.title}</h2>
      {props.children ? (
        <div className="mt-3 text-[13px] leading-relaxed text-white/62 sm:text-sm">{props.children}</div>
      ) : null}
      {props.action ? <div className="mt-6">{props.action}</div> : null}
    </section>
  );
}
