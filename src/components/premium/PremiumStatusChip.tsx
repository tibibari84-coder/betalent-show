import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function PremiumStatusChip(props: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("foundation-status-chip", props.className)}>
      <strong>{props.label}</strong>
      {props.value}
    </span>
  );
}
