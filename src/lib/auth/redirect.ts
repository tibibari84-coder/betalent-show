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
