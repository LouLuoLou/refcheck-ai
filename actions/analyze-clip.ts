"use server";

import type {
  AnalyzeClipResult,
  BasketballCall,
} from "@/lib/types";
import { AnalyzeInputSchema, PlayUnderstandingSchema } from "@/lib/validate";
import { hasGeminiKey } from "@/lib/env";
import { mapDescribePlayError, mapSynthesizeError } from "@/lib/analysis-errors";
import { runDescribeUploadPipeline } from "@/lib/run-describe-upload-pipeline";
import { runStage5 } from "@/lib/gemini";
import { selectRulesForCandidates } from "@/lib/rules/basketball";

const ACCEPTED_MIMES = new Set(["video/mp4", "video/quicktime", "video/webm"]);
const MAX_BYTES = 10 * 1024 * 1024;

function newAnalysisId(): string {
  return globalThis.crypto && "randomUUID" in globalThis.crypto
    ? globalThis.crypto.randomUUID()
    : `id-${Date.now().toString(36)}`;
}

/**
 * Full upload → Stage 3/3b → Stage 5 in one invocation (one warm serverless
 * function, one browser round-trip vs describe + synthesize separately).
 */
export async function analyzeClipAction(
  formData: FormData
): Promise<AnalyzeClipResult> {
  if (!hasGeminiKey()) {
    return {
      ok: false,
      error: "MODEL_ERROR",
      message:
        "The server is missing a GEMINI_API_KEY. Add it to .env.local or Vercel env, then redeploy.",
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
  const originalCall = validation.data.original_call as BasketballCall | null;
  const originalCallFreetext = validation.data.original_call_freetext;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const understanding = await runDescribeUploadPipeline({
      buffer,
      mimeType,
      originalCall,
      originalCallFreetext,
    });

    const parsed = PlayUnderstandingSchema.safeParse(understanding);
    if (!parsed.success) {
      return {
        ok: false,
        error: "VALIDATION",
        message: "Understanding payload was invalid after describe.",
        retryable: false,
      };
    }

    const rules = selectRulesForCandidates(parsed.data.candidate_rules);
    const verdict = await runStage5(
      parsed.data,
      originalCall,
      originalCallFreetext,
      rules
    );

    return {
      ok: true,
      analysisId: newAnalysisId(),
      understanding: parsed.data,
      verdict,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";

    if (message === "missing_api_key") {
      return {
        ok: false,
        error: "MODEL_ERROR",
        message:
          "The server is missing a GEMINI_API_KEY. Add it to .env.local or Vercel env, then redeploy.",
        retryable: false,
      };
    }
    if (message === "file_upload_timeout" || message === "file_not_active") {
      const mapped = mapDescribePlayError(err);
      return {
        ok: false,
        error: "UPLOAD_FAILED",
        message: mapped.message,
        retryable: mapped.retryable,
      };
    }

    if (
      message.includes("timeout") &&
      !message.includes("stage3") &&
      !message.includes("stage5")
    ) {
      return {
        ok: false,
        error: "MODEL_TIMEOUT",
        message:
          "The model took longer than expected. Try again with the same clip or a shorter segment.",
        retryable: true,
      };
    }

    console.error("analyzeClipAction failed:", err);

    if (message.toLowerCase().includes("stage5")) {
      const mapped = mapSynthesizeError(err);
      return {
        ok: false,
        error: "MODEL_ERROR",
        message: mapped.message,
        retryable: mapped.retryable,
      };
    }

    const mapped = mapDescribePlayError(err);
    return {
      ok: false,
      error: "MODEL_ERROR",
      message: mapped.message,
      retryable: mapped.retryable,
    };
  }
}
