/**
 * User-facing copy for server-action failures (no secrets).
 */

import { ZodError } from "zod";

export function mapDescribePlayError(err: unknown): {
  message: string;
  retryable: boolean;
} {
  if (err instanceof ZodError) {
    return {
      message:
        "The model’s play summary did not match the expected format. Try again with the same clip.",
      retryable: true,
    };
  }
  const raw = err instanceof Error ? err.message : String(err ?? "unknown");
  const m = raw.toLowerCase();

  if (m.includes("missing_api_key")) {
    return {
      message:
        "The server is missing GEMINI_API_KEY. Add it in Vercel Environment Variables and redeploy.",
      retryable: false,
    };
  }
  if (m.includes("stage3_timeout") || m.includes("stage3b_timeout")) {
    return {
      message:
        "Gemini took too long on the video pass. Try again — the second attempt often succeeds after a cold start.",
      retryable: true,
    };
  }
  if (m.includes("file_upload_timeout")) {
    return {
      message:
        "The clip stayed in “processing” too long on Google’s file servers. Try a smaller or shorter MP4, then retry.",
      retryable: true,
    };
  }
  if (m.includes("file_not_active")) {
    return {
      message:
        "The uploaded clip did not become ready for analysis. Try again or use a different export (H.264 MP4).",
      retryable: true,
    };
  }
  if (m.includes("429") || m.includes("resource_exhausted")) {
    return {
      message:
        "Gemini rate limit hit. Wait a few seconds and try again, or check your API quota.",
      retryable: true,
    };
  }
  if (
    m.includes("terminated") ||
    m.includes("aborted") ||
    m.includes("econnreset") ||
    m.includes("fetch failed")
  ) {
    return {
      message:
        "The hosting platform cut the request short (network or time limit). Retry once — if it persists, confirm Vercel max duration is 60s on your plan.",
      retryable: true,
    };
  }
  if (m.includes("not valid json") || m.includes("model response was not valid")) {
    return {
      message:
        "The model returned malformed JSON. Try again with the same clip.",
      retryable: true,
    };
  }
  if (m.includes("timeout")) {
    return {
      message:
        "A step timed out. Try again with a shorter clip or smaller file.",
      retryable: true,
    };
  }

  return {
    message:
      "Something went wrong analyzing that clip. Try again, or upload a different file.",
    retryable: true,
  };
}

export function mapSynthesizeError(err: unknown): {
  message: string;
  retryable: boolean;
} {
  if (err instanceof ZodError) {
    return {
      message:
        "The verdict response did not match the expected format. Try again.",
      retryable: true,
    };
  }
  const raw = err instanceof Error ? err.message : String(err ?? "unknown");
  const m = raw.toLowerCase();

  if (m.includes("missing_api_key")) {
    return {
      message:
        "The server is missing GEMINI_API_KEY. Add it in Vercel Environment Variables and redeploy.",
      retryable: false,
    };
  }
  if (m.includes("stage5_timeout")) {
    return {
      message:
        "Verdict synthesis timed out. Retry — cold starts on serverless hosts often clear on the second try.",
      retryable: true,
    };
  }
  if (m.includes("429") || m.includes("resource_exhausted")) {
    return {
      message:
        "Gemini rate limit hit during verdict. Wait a few seconds and try again.",
      retryable: true,
    };
  }
  if (
    m.includes("terminated") ||
    m.includes("aborted") ||
    m.includes("econnreset") ||
    m.includes("fetch failed")
  ) {
    return {
      message:
        "The verdict step was interrupted (host time limit or network). Retry once.",
      retryable: true,
    };
  }
  if (m.includes("not valid json") || m.includes("model response was not valid")) {
    return {
      message:
        "The model returned malformed verdict JSON. Try again.",
      retryable: true,
    };
  }
  if (m.includes("timeout")) {
    return {
      message: "Verdict synthesis timed out. Try again.",
      retryable: true,
    };
  }

  return {
    message:
      "Something went wrong producing the verdict. Please try again.",
    retryable: true,
  };
}
