import type { ReactNode } from "react";

/** Fills the column so nested app/welcome routes can use flex + min-h-0 correctly. */
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-0 flex-1 flex-col">{children}</div>;
}
