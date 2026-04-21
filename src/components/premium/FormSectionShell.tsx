import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function FormSectionShell(props: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("foundation-panel foundation-form-section p-4 sm:p-6", props.className)}>
      <p className="foundation-kicker">{props.eyebrow}</p>
      <h2 className="mt-3 text-[1.4rem] font-semibold text-white sm:text-2xl">{props.title}</h2>
      {props.description ? (
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-white/62 sm:text-sm">
          {props.description}
        </p>
      ) : null}
      <div className="mt-6">{props.children}</div>
    </section>
  );
}
