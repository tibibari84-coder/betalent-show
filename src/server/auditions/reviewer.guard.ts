/**
 * Minimal gate for the internal audition review stub — not a full RBAC model.
 * Set `BETALENT_AUDITION_REVIEWER_EMAILS` to a comma-separated list (lowercase matching).
 */
export function parseAuditionReviewerEmailAllowlist(): Set<string> {
  const raw = process.env.BETALENT_AUDITION_REVIEWER_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAuditionReviewerEmail(email: string): boolean {
  const allow = parseAuditionReviewerEmailAllowlist();
  if (allow.size === 0) return false;
  return allow.has(email.trim().toLowerCase());
}
