import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type MobilePageShellProps = {
  children: ReactNode;
  className?: string;
};

/** Vertical rhythm and padding suited to small viewports first.
 *  Do not use flex-1/min-h-0 here when nested inside AppShell’s scrollable <main> —
 *  that combo traps height to the viewport and breaks vertical scrolling.
 */
export function MobilePageShell({ children, className }: MobilePageShellProps) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-8 py-10 sm:gap-10 sm:py-12",
        className,
      )}
    >
      {children}
    </div>
  );
}
