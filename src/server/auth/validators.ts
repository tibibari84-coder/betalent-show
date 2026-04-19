import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/lib/auth/constants";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldErrorMap = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateEmail(raw: string): string | undefined {
  const email = normalizeEmail(raw);
  if (!email) {
    return "Email is required.";
  }
  if (!EMAIL_RE.test(email)) {
    return "Enter a valid email address.";
  }
  return undefined;
}

export function validateNewPassword(raw: string): string | undefined {
  if (!raw) {
    return "Password is required.";
  }
  if (raw.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (raw.length > PASSWORD_MAX_LENGTH) {
    return `Use at most ${PASSWORD_MAX_LENGTH} characters.`;
  }
  return undefined;
}

export function validatePasswordForLogin(raw: string): string | undefined {
  if (!raw) {
    return "Password is required.";
  }
  return undefined;
}

export function validateConfirmPassword(
  password: string,
  confirm: string,
): string | undefined {
  if (password !== confirm) {
    return "Passwords do not match.";
  }
  return undefined;
}
