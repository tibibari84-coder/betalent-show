import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <article className="w-full rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6 shadow-sm backdrop-blur-sm">
      <header className="mb-6 text-center">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-foreground/60">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </article>
  );
}
