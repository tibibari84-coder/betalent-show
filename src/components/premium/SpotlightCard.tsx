import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function SpotlightCard(props: {
  children: ReactNode;
  className?: string;
  /** Slightly quieter surface for dense stacks. */
  emphasis?: "high" | "medium";
}) {
  const emphasis = props.emphasis ?? "high";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.35rem] border border-white/[0.08] p-5 shadow-[0_16px_48px_-20px_rgba(0,0,0,0.65)] sm:p-6",
        emphasis === "high"
          ? "bg-gradient-to-b from-white/[0.07] via-white/[0.03] to-transparent"
          : "bg-white/[0.035]",
        props.className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-30%,rgba(255,255,255,0.06),transparent_55%)]"
        aria-hidden
      />
      <div className="relative">{props.children}</div>
    </div>
  );
}
