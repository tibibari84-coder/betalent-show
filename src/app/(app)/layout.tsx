import type { ReactNode } from "react";

/** Route groups under `(app)` use nested layouts for auth / onboarding gates. */
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return children;
}
