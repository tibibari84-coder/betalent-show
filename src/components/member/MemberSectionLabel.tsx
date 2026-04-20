import type { ReactNode } from "react";

/** Uppercase section chrome — restrained hierarchy. */
export function MemberSectionLabel(props: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/48">
      {props.children}
    </p>
  );
}
