/**
 * Prevent open redirects — only same-origin relative paths.
 * Blocks return to auth/onboarding screens after login to avoid pointless loops.
 */
export function sanitizeRedirectPath(raw: string | undefined | null): string {
  if (raw == null || typeof raw !== "string") {
    return "/app";
  }
  const trimmed = raw.trim();
  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/app";
  }
  if (
    trimmed === "/login" ||
    trimmed.startsWith("/login/") ||
    trimmed === "/register" ||
    trimmed.startsWith("/register/")
  ) {
    return "/app";
  }
  if (trimmed === "/welcome" || trimmed.startsWith("/welcome/")) {
    return "/app";
  }
  return trimmed;
}

/** After login/register: unfinished onboarding always goes to `/welcome` first. */
export function resolvePostAuthRedirect(
  user: { onboardingCompletedAt: Date | null },
  redirectParam?: string | null,
): string {
  if (!user.onboardingCompletedAt) {
    return "/welcome";
  }
  return sanitizeRedirectPath(redirectParam ?? undefined);
}
