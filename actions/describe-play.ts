"use server";

import type {
  BasketballCall,
  DescribePlayResult,
} from "@/lib/types";
import { AnalyzeInputSchema } from "@/lib/validate";
import { hasGeminiKey } from "@/lib/env";
import { runStage3, uploadVideoToGemini } from "@/lib/gemini";

const ACCEPTED_MIMES = new Set(["video/mp4", "video/quicktime", "video/webm"]);
const MAX_BYTES = 10 * 1024 * 1024;

export async function describePlayAction(
  formData: FormData
): Promise<DescribePlayResult> {
  if (!hasGeminiKey()) {
    return {
      ok: false,
      error: "MODEL_ERROR",
      message:
        "The server is missing a GEMINI_API_KEY. Add it to .env.local and restart the dev server.",
      retryable: false,
    };
  }

  const file = formData.get("video");
  const sport = formData.get("sport");
  const callRaw = formData.get("original_call");
  const freetextRaw = formData.get("original_call_freetext");

  const validation = AnalyzeInputSchema.safeParse({
    sport,
    original_call: callRaw === "" || callRaw === null ? null : callRaw,
    original_call_freetext:
      typeof freetextRaw === "string" && freetextRaw.trim().length > 0
        ? freetextRaw.trim()
        : null,
  });

  if (!validation.success) {
    return {
      ok: false,
      error: "VALIDATION",
      message: "The form input was not valid.",
      retryable: false,
    };
  }

  if (!(file instanceof File)) {
    return {
      ok: false,
      error: "VALIDATION",
      message: "No video file was received.",
      retryable: false,
    };
  }

  if (file.size === 0) {
    return {
      ok: false,
      error: "VALIDATION",
      message: "The uploaded file was empty.",
      retryable: false,
    };
  }

  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      error: "VALIDATION",
      message: "Please keep clips under 10 MB.",
      retryable: false,
    };
  }

  const mimeType = ACCEPTED_MIMES.has(file.type) ? file.type : "video/mp4";

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const uploaded = await uploadVideoToGemini(buffer, mimeType);

    const understanding = await runStage3(
      uploaded,
      validation.data.original_call as BasketballCall | null,
      validation.data.original_call_freetext
    );

    return {
      ok: true,
      analysisId:
        globalThis.crypto && "randomUUID" in globalThis.crypto
          ? globalThis.crypto.randomUUID()
          : `id-${Date.now().toString(36)}`,
      understanding,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";

    if (message.includes("timeout")) {
      return {
        ok: false,
        error: "MODEL_TIMEOUT",
        message:
          "The model took longer than expected. Try again, or pick a sample play.",
        retryable: true,
      };
    }
    if (message === "missing_api_key") {
      return {
        ok: false,
        error: "MODEL_ERROR",
        message:
          "The server is missing a GEMINI_API_KEY. Add it to .env.local.",
        retryable: false,
      };
    }
    if (message === "file_upload_timeout" || message === "file_not_active") {
      return {
        ok: false,
        error: "UPLOAD_FAILED",
        message:
          "We couldn't upload that clip for analysis. Check your connection and try again.",
        retryable: true,
      };
    }
    console.error("describePlayAction failed:", err);
    return {
      ok: false,
      error: "MODEL_ERROR",
      message:
        "Something went wrong analyzing that clip. Try again, or pick a sample play.",
      retryable: true,
    };
  }
}
