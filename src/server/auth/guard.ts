import "server-only";

import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { resolvePostAuthRedirect } from "@/lib/auth/redirect";

import { getSession, type AuthSession } from "./session";

export type AuthenticatedUser = AuthSession["user"];
export type AccessErrorCode =
  | "UNAUTHENTICATED"
  | "ONBOARDING_REQUIRED"
  | "FORBIDDEN";

export class AccessError extends Error {
  constructor(
    public readonly code: AccessErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AccessError";
  }
}

export function isCreatorRole(role: UserRole): boolean {
  return role === "CREATOR" || role === "ADMIN";
}

export function isAdminRole(role: UserRole): boolean {
  return role === "ADMIN";
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireApiAuth(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    throw new AccessError("UNAUTHENTICATED", "Authentication is required.");
  }
  return session;
}

export async function requireApiOnboarded(): Promise<AuthSession> {
  const session = await requireApiAuth();
  if (!session.user.onboardingCompletedAt) {
    throw new AccessError(
      "ONBOARDING_REQUIRED",
      "Complete creator onboarding before using this route.",
    );
  }
  return session;
}

export async function requireApiAdmin(): Promise<AuthSession> {
  const session = await requireApiOnboarded();
  if (!isAdminRole(session.user.role)) {
    throw new AccessError("FORBIDDEN", "Admin access is required.");
  }
  return session;
}

/** Must be signed in (any onboarding state). */
export async function requireAuth(loginReturnPath: string): Promise<AuthSession> {
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

export async function getAdminAccess(loginReturnPath: string): Promise<
  | {
      allowed: true;
      session: AuthSession;
    }
  | {
      allowed: false;
      session: AuthSession;
    }
> {
  const session = await requireAuthenticatedOnboarded(loginReturnPath);

  if (!isAdminRole(session.user.role)) {
    return {
      allowed: false,
      session,
    };
  }

  return {
    allowed: true,
    session,
  };
}
