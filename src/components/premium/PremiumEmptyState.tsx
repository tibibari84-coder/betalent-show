import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/** Intentional “no data yet” — composed like a streaming empty shelf, not a dev placeholder. */
export function PremiumEmptyState(props: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-b from-white/[0.05] via-transparent to-transparent px-8 py-12 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:rounded-[2rem] sm:px-10 sm:py-14",
        props.className,
      )}
    >
      <div className="relative flex min-h-[12rem] flex-col justify-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-foreground/48">
          {props.title}
        </p>
        <div className="mt-3 max-w-md text-sm leading-relaxed text-foreground/72">
          {props.children}
        </div>
      </div>
    </section>
  );
}
