import type { ReactNode } from "react";

import { PremiumEmptyState } from "./PremiumEmptyState";

export function PremiumErrorState(props: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <PremiumEmptyState title={props.title} className={props.className}>
      <span className="text-[#f6b4a8]">{props.children}</span>
    </PremiumEmptyState>
  );
}
