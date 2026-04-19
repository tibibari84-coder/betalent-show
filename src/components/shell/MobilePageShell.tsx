import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type MobilePageShellProps = {
  children: ReactNode;
  className?: string;
};

/** Vertical rhythm and padding suited to small viewports first. */
export function MobilePageShell({ children, className }: MobilePageShellProps) {
  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col gap-6 py-8", className)}
    >
      {children}
    </div>
  );
}
