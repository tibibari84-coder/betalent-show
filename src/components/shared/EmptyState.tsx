import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function EmptyState(props: {
  title: string;
  children: ReactNode;
  /** Premium framed empty — intentional, not “dev placeholder”. */
  variant?: "default" | "premium";
}) {
  const premium = props.variant === "premium";
  return (
    <div
      className={cn(
        "rounded-[1.35rem] p-5 sm:p-6",
        premium
          ? "border border-foreground/12 bg-gradient-to-b from-foreground/[0.06] to-foreground/[0.02] shadow-[0_12px_48px_-16px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.05)]"
          : "border border-dashed border-foreground/14 bg-foreground/[0.025]",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/48">
        {props.title}
      </p>
      <div className="mt-3 text-sm leading-relaxed text-foreground/72">
        {props.children}
      </div>
    </div>
  );
}
