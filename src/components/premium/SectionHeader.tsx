import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function SectionHeader(props: {
  title: string;
  subtitle?: ReactNode;
  eyebrow?: string;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-1.5", props.className)}>
      {props.eyebrow ? (
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground/42">
          {props.eyebrow}
        </p>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {props.title}
        </h2>
      </div>
      {props.subtitle ? (
        <p className="max-w-xl text-xs leading-relaxed text-foreground/58 sm:text-[13px]">
          {props.subtitle}
        </p>
      ) : null}
    </header>
  );
}
