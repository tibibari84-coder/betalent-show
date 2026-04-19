import type { ReactNode } from "react";

import { requireAuth } from "@/server/auth/guard";

export default async function InternalGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth("/internal");
  return children;
}
