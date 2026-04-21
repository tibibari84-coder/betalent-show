"use client";

import { cn } from "@/lib/utils/cn";

import type { AdminActionState } from "./AdminActionState";

export function AdminFeedback(props: {
  state: AdminActionState;
  className?: string;
}) {
  if (!props.state.error && !props.state.detail) return null;

  return (
    <p
      className={cn(
        "rounded-[1rem] border px-3 py-2 text-sm",
        props.state.error
          ? "border-red-500/20 bg-red-500/10 text-red-200"
          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
        props.className,
      )}
    >
      {props.state.error || props.state.detail}
    </p>
  );
}
