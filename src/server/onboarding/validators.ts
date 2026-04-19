const USERNAME_RE = /^[a-z0-9_]{3,24}$/;

export type OnboardingFieldErrors = {
  displayName?: string;
  username?: string;
  city?: string;
  country?: string;
};

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateDisplayName(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) {
    return "Display name is required.";
  }
  if (t.length < 2) {
    return "Use at least 2 characters.";
  }
  if (t.length > 48) {
    return "Use at most 48 characters.";
  }
  return undefined;
}

export function validateUsername(raw: string): string | undefined {
  const u = normalizeUsername(raw);
  if (!u) {
    return "Username is required.";
  }
  if (!USERNAME_RE.test(u)) {
    return "Use 3–24 lowercase letters, numbers, or underscores.";
  }
  return undefined;
}

export function validateCity(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) {
    return "City is required.";
  }
  if (t.length > 64) {
    return "City is too long.";
  }
  return undefined;
}

export function validateCountry(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) {
    return "Country is required.";
  }
  if (t.length > 64) {
    return "Country is too long.";
  }
  return undefined;
}
