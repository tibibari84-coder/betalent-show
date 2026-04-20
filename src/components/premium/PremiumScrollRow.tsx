import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/** Horizontal bleed scroll lane — poster rails and catalogs. */
export function PremiumScrollRow(props: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "member-rail-bleed -mx-1 flex gap-4 overflow-x-auto overscroll-x-contain px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory touch-pan-x [&::-webkit-scrollbar]:hidden",
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}
