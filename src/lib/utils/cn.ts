/**
 * Join class names; keeps dependencies minimal until a fuller design system lands.
 */
export function cn(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}
