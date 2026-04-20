import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/** Structured facts without stacked “SaaS card” density — airy catalog metadata. */
export function PremiumMetaGrid(props: {
  rows: { label: string; value: ReactNode }[];
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:gap-x-14",
        props.className,
      )}
    >
      {props.rows.map((row) => (
        <div key={row.label} className="flex flex-col gap-1.5">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/42">
            {row.label}
          </dt>
          <dd className="text-sm font-medium leading-snug text-foreground sm:text-[15px]">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
