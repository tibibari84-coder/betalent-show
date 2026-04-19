import { headers } from "next/headers";

/**
 * Current pathname from `middleware` (`x-pathname`). Falls back when headers are
 * missing (e.g. tests) so guards still pick a sensible login return URL.
 */
export async function getRequestedPathname(fallback: string): Promise<string> {
  const pathname = (await headers()).get("x-pathname")?.trim();
  return pathname || fallback;
}
