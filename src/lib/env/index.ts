/**
 * Minimal env surface for early phases. Expand with validation when integrating services.
 */
export const publicAppEnv =
  process.env.NEXT_PUBLIC_APP_ENV ?? "development";

export function getOptionalEnv(key: string): string | undefined {
  const value = process.env[key];
  return value === "" ? undefined : value;
}
