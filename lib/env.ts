export function getGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
  return key && key.trim().length > 0 ? key.trim() : null;
}

export function hasGeminiKey(): boolean {
  return getGeminiApiKey() !== null;
}

export const GEMINI_MODEL = "gemini-2.5-flash";
