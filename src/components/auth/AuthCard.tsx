import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

/** Frosted panel — reads as tvOS / streaming sheet over ambient canvas. */
export function AuthCard({ title, subtitle, children, className }: AuthCardProps) {
  return (
    <article
      className={cn(
        "w-full rounded-[1.75rem] border border-foreground/10 bg-foreground/[0.03] p-7 shadow-[0_28px_80px_-36px_rgba(0,0,0,0.85)] backdrop-blur-2xl supports-[backdrop-filter]:bg-foreground/[0.02] dark:border-white/[0.1] dark:bg-white/[0.05] dark:shadow-[0_32px_90px_-40px_rgba(0,0,0,0.95)] dark:supports-[backdrop-filter]:bg-white/[0.04] sm:p-8",
        className,
      )}
    >
      <header className="mb-7 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-foreground/65">
            {subtitle}
          </p>
        ) : null}
      </header>
      {children}
    </article>
  );
}
