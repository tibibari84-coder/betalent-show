import type { ReactNode } from "react";

/** Full-height shell that can grow past the viewport — avoids nested scroll traps. */
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full min-h-[100dvh] flex-col">{children}</div>
  );
}
