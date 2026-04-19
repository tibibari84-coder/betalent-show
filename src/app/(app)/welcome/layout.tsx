import type { ReactNode } from "react";

import { requireIncompleteOnboarding } from "@/server/auth/guard";
import { getRequestedPathname } from "@/server/auth/request-path";

export default async function WelcomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireIncompleteOnboarding(await getRequestedPathname("/welcome"));

  return children;
}
