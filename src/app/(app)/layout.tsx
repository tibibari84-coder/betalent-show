import type { ReactNode } from "react";

import { requireAuth } from "@/server/auth/guard";

export default async function AppGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth("/app");
  return children;
}
