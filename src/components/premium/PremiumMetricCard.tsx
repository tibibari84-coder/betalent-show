import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type PremiumMetricTone = "ember" | "cobalt" | "gold" | "violet" | "emerald";

export function PremiumMetricCard(props: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  className?: string;
  tone?: PremiumMetricTone;
}) {
  return (
    <div
      className={cn(
        "foundation-metric-card",
        props.tone ? `foundation-tint-${props.tone}` : "foundation-tint-cobalt",
        props.className,
      )}
    >
      <p className="foundation-kicker">{props.label}</p>
      <div className="mt-3 text-lg font-semibold text-white">{props.value}</div>
      {props.detail ? (
        <p className="mt-2 text-sm text-white/58">{props.detail}</p>
      ) : null}
    </div>
  );
}
