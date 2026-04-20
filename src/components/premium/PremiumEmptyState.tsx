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
      <div
        className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(130,140,220,0.35),transparent_68%)] blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(220,190,140,0.18),transparent_68%)] blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_120%,rgba(255,255,255,0.05),transparent_58%)]"
        aria-hidden
      />
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
