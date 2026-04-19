/**
 * Prevent open redirects — only same-origin relative paths.
 */
export function sanitizeRedirectPath(raw: string | undefined | null): string {
  if (raw == null || typeof raw !== "string") {
    return "/app";
  }
  const trimmed = raw.trim();
  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/app";
  }
  return trimmed;
}

/** After login/register: unfinished onboarding always goes to /welcome first. */
export function resolvePostAuthRedirect(
  user: { onboardingCompletedAt: Date | null },
  redirectParam?: string | null,
): string {
  if (!user.onboardingCompletedAt) {
    return "/welcome";
  }
  return sanitizeRedirectPath(redirectParam ?? undefined);
}
