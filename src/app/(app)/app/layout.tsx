import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { requireAuth } from "@/server/auth/guard";
import { getSession } from "@/server/auth/session";

export default async function AppMemberLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth("/app");
  const session = await getSession();
  if (!session) {
    return null;
  }
  if (!session.user.onboardingCompletedAt) {
    redirect("/welcome");
  }
  return children;
}
