import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function FloatingTopChrome(props: {
  title: string;
  subtitle?: ReactNode;
  utility?: ReactNode;
  status?: ReactNode;
  navigation?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("foundation-animated-enter foundation-topbar-panel px-4 py-3 sm:px-6 lg:px-8", props.className)}>
      <div className="relative flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap sm:gap-4">
          <div className="hidden min-w-0 sm:block">
            <p className="foundation-kicker">BETALENT</p>
            <h1 className="mt-2 text-[1.05rem] font-semibold tracking-[0.12em] text-white sm:text-lg">
              {props.title}
            </h1>
            {props.subtitle ? (
              <p className="mt-1 text-[12px] text-white/38">{props.subtitle}</p>
            ) : null}
          </div>
          {props.utility ? <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">{props.utility}</div> : null}
        </div>
        {props.status ? <div className="hidden flex-wrap gap-2 sm:flex">{props.status}</div> : null}
        {props.navigation}
      </div>
    </div>
  );
}
