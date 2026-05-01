export function getGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
  return key && key.trim().length > 0 ? key.trim() : null;
}

export function hasGeminiKey(): boolean {
  return getGeminiApiKey() !== null;
}

export const GEMINI_MODEL = "gemini-2.5-flash";

// Frames per second we ask Gemini to sample from the uploaded video. Raising
// this from the default 1 gives the model more visual anchor points for
// timestamp placement. 2 is a good tradeoff between accuracy and token cost.
export const VIDEO_FPS = 2;

// Systematic offset (seconds) applied to every event timestamp client-side.
// Defaults to 0. Nudge this at dress rehearsal if events still run early/late.
export const TIMESTAMP_OFFSET_SECONDS = 0;

/** Longer uploads must use the in-browser trimmer; window cannot exceed this length. */
export const MAX_ANALYSIS_CLIP_SECONDS = 10;
