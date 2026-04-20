import type { ReactNode } from "react";

/** Compact legal-safety / clarity notice — premium, restrained. */
export function DisclaimerStrip(props: { children: ReactNode }) {
  return (
    <div className="rounded-[1.35rem] border border-foreground/12 bg-gradient-to-br from-foreground/[0.06] to-transparent p-5 text-xs leading-relaxed text-foreground/75 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] sm:p-6">
      {props.children}
    </div>
  );
}
