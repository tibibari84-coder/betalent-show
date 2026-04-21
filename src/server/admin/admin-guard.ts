"use server";

import { getSession } from "@/server/auth/session";
import { isAdminRole } from "@/server/auth/guard";

export async function requireAdminActionAccess() {
  const session = await getSession();

  if (!session?.user.onboardingCompletedAt) {
    throw new Error("Sign in as an admin to continue.");
  }

  if (!isAdminRole(session.user.role)) {
    throw new Error("Admin access is required.");
  }

  return session;
}
