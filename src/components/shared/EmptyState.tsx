import type { ReactNode } from "react";

export function EmptyState(props: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-foreground/15 bg-foreground/[0.02] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
        {props.title}
      </p>
      <div className="mt-2 text-sm leading-relaxed text-foreground/70">
        {props.children}
      </div>
    </div>
  );
}
