/**
 * Lightweight checks for optional capabilities — avoid throwing on missing optional keys.
 */

export function isOpenAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
