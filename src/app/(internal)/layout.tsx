import type { ReactNode } from "react";

import { requireAuthenticatedOnboarded } from "@/server/auth/guard";
import { getRequestedPathname } from "@/server/auth/request-path";

export default async function InternalGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuthenticatedOnboarded(await getRequestedPathname("/internal"));

  return children;
}
