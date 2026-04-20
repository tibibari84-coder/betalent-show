import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { PremiumScrollRow } from "./PremiumScrollRow";
import { SectionHeader } from "./SectionHeader";

export function ContentRail(props: {
  title: string;
  subtitle?: ReactNode;
  eyebrow?: string;
  /** Horizontal scroll lane — catalog / spotlight rows. */
  children: ReactNode;
  className?: string;
  headerClassName?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-4", props.className)}>
      <SectionHeader
        eyebrow={props.eyebrow}
        title={props.title}
        subtitle={props.subtitle}
        className={props.headerClassName}
      />
      <PremiumScrollRow>{props.children}</PremiumScrollRow>
    </section>
  );
}
