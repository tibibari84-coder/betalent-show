import { redirect } from "next/navigation";

import { resolvePostAuthRedirect } from "@/lib/auth/redirect";

import { getSession } from "./session";

export async function requireAuth(returnPath: string) {
  const session = await getSession();
  if (!session) {
    redirect(`/login?redirect=${encodeURIComponent(returnPath)}`);
  }
  return session;
}

/** If a session exists, leave auth pages for onboarding or the app. */
export async function redirectAuthenticatedAway(
  redirectParam?: string | null,
) {
  const session = await getSession();
  if (!session) {
    return;
  }
  redirect(resolvePostAuthRedirect(session.user, redirectParam));
}
