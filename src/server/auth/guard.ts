import { redirect } from "next/navigation";

import { resolvePostAuthRedirect } from "@/lib/auth/redirect";

import { getSession } from "./session";

/** Must be signed in (any onboarding state). */
export async function requireAuth(loginReturnPath: string) {
  const session = await getSession();
  if (!session) {
    redirect(`/login?redirect=${encodeURIComponent(loginReturnPath)}`);
  }
  return session;
}

/** Signed in + onboarding finished — consumer `/app` and `/internal` routes. */
export async function requireAuthenticatedOnboarded(loginReturnPath: string) {
  const session = await requireAuth(loginReturnPath);
  if (!session.user.onboardingCompletedAt) {
    redirect("/welcome");
  }
  return session;
}

/** Signed in but onboarding not finished — `/welcome` only. */
export async function requireIncompleteOnboarding(loginReturnPath: string) {
  const session = await requireAuth(loginReturnPath);
  if (session.user.onboardingCompletedAt) {
    redirect("/app");
  }
  return session;
}

/** Leave `/login` and `/register` once a session exists. */
export async function redirectAuthenticatedAway(
  redirectParam?: string | null,
) {
  const session = await getSession();
  if (!session) {
    return;
  }
  redirect(resolvePostAuthRedirect(session.user, redirectParam));
}
