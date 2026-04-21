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
        "relative overflow-hidden rounded-[1.45rem] border border-white/[0.08] p-5 shadow-[0_22px_58px_-28px_rgba(0,0,0,0.78)] backdrop-blur-2xl sm:p-6",
        emphasis === "high"
          ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03)),linear-gradient(135deg,rgba(255,255,255,0.02),transparent)]"
          : "bg-white/[0.04]",
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
