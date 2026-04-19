import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell/AppShell";
import { requireAuth } from "@/server/auth/guard";
import { getSession } from "@/server/auth/session";

export default async function AppMemberLayout({
  children,
}: {
  children: ReactNode;
}) {
  const headersList = await headers();
  const returnPath = headersList.get("x-pathname")?.trim() || "/app";

  await requireAuth(returnPath);
  const session = await getSession();
  if (!session) {
    return null;
  }
  if (!session.user.onboardingCompletedAt) {
    redirect("/welcome");
  }

  return <AppShell>{children}</AppShell>;
}
