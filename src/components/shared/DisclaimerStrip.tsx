import type { ReactNode } from "react";

/** Compact legal-safety / clarity notice — premium, restrained. */
export function DisclaimerStrip(props: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-foreground/12 bg-foreground/[0.02] p-4 text-xs leading-relaxed text-foreground/72">
      {props.children}
    </div>
  );
}
