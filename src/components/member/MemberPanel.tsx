import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/** Glossy elevated panel for stats and structured content. */
export function MemberPanel(props: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.35rem] border border-foreground/10 bg-foreground/[0.035] p-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-6",
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}
