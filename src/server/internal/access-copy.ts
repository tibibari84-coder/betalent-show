/**
 * Shared operator-facing copy for internal BETALENT routes (minimal gate — not full RBAC).
 */

export const OPERATOR_EMAIL_ALLOWLIST_ENV = "BETALENT_AUDITION_REVIEWER_EMAILS";

export function missingOperatorAllowlistMessage(): string {
  return `Internal BETALENT tools require ${OPERATOR_EMAIL_ALLOWLIST_ENV} (comma-separated emails, lowercase matching). Until it is set in the deployment environment, operator actions stay disabled.`;
}

export function notAuthorizedOperatorMessage(): string {
  return `Your account is signed in but is not on the BETALENT operator allowlist (${OPERATOR_EMAIL_ALLOWLIST_ENV}). Internal queue and publishing actions stay hidden.`;
}
