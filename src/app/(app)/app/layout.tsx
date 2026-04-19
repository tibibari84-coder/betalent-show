import type { ReactNode } from "react";

import { AppShell } from "@/components/shell/AppShell";
import { requireAuthenticatedOnboarded } from "@/server/auth/guard";
import { getRequestedPathname } from "@/server/auth/request-path";

export default async function AppMemberLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuthenticatedOnboarded(await getRequestedPathname("/app"));

  return <AppShell>{children}</AppShell>;
}
