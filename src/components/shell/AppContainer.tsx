import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type AppContainerProps = {
  children: ReactNode;
  className?: string;
};

/** Narrow, mobile-first content width; use inside pages and layouts. */
export function AppContainer({ children, className }: AppContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-md px-4 sm:max-w-xl sm:px-6 lg:max-w-3xl lg:px-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
