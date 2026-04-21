import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function AppPage(props: {
  hero?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6 sm:space-y-8", props.className)}>
      {props.hero}
      {props.children}
    </div>
  );
}
