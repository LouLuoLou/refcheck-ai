/**
 * Bounded retries for transient Gemini / network failures (cold starts, 429, blips).
 */

const ATTEMPTS = 3;
const BASE_DELAY_MS = 700;

function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err ?? "");
}

export function isNonRetryableAuthOrConfig(err: unknown): boolean {
  const m = messageOf(err).toLowerCase();
  return (
    m.includes("missing_api_key") ||
    m.includes("invalid api key") ||
    m.includes("api key not valid") ||
    m.includes("401") ||
    m.includes("403 forbidden")
  );
}

export function isRetryableGeminiFailure(err: unknown): boolean {
  if (isNonRetryableAuthOrConfig(err)) return false;
  const m = messageOf(err).toLowerCase();
  if (m.includes("file_not_active")) return false;
  if (m.includes("stage3b_invalid_response")) return false;
  if (m.includes("stage3b_event_count_mismatch")) return false;
  return (
    m.includes("429") ||
    m.includes("503") ||
    m.includes("502") ||
    m.includes("500") ||
    m.includes("resource_exhausted") ||
    m.includes("unavailable") ||
    m.includes("econnreset") ||
    m.includes("fetch failed") ||
    m.includes("network") ||
    m.includes("und_err") ||
    m.includes("socket hang") ||
    m.includes("socket error") ||
    m.includes("aborted") ||
    m.includes("terminated") ||
    m.includes("econnrefused") ||
    m.includes("stage3_timeout") ||
    m.includes("stage5_timeout") ||
    m.includes("stage3b_timeout") ||
    m.includes("file_upload_timeout") ||
    m.includes("not valid json") ||
    m.includes("model response was not valid json")
  );
}

export async function withGeminiRetries<T>(
  label: string,
  run: () => Promise<T>
): Promise<T> {
  let last: unknown;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      return await run();
    } catch (e) {
      last = e;
      if (attempt === ATTEMPTS || !isRetryableGeminiFailure(e)) {
        throw e;
      }
      const delay = BASE_DELAY_MS * attempt;
      console.warn(
        `[${label}] transient failure (attempt ${attempt}/${ATTEMPTS}), retry in ${delay}ms:`,
        messageOf(e)
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw last;
}
