"use server";

import type {
  BasketballCall,
  PlayUnderstanding,
  SynthesizeVerdictResult,
} from "@/lib/types";
import { PlayUnderstandingSchema } from "@/lib/validate";
import { hasGeminiKey } from "@/lib/env";
import { mapSynthesizeError } from "@/lib/analysis-errors";
import { runStage5 } from "@/lib/gemini";
import { selectRulesForCandidates } from "@/lib/rules/basketball";

type SynthesizeInput = {
  understanding: PlayUnderstanding;
  original_call: BasketballCall | null;
  original_call_freetext: string | null;
};

export async function synthesizeVerdictAction(
  input: SynthesizeInput
): Promise<SynthesizeVerdictResult> {
  if (!hasGeminiKey()) {
    return {
      ok: false,
      error: "MODEL_ERROR",
      message:
        "The server is missing a GEMINI_API_KEY. Add it to .env.local or Vercel env, then redeploy.",
      retryable: false,
    };
  }

  const validation = PlayUnderstandingSchema.safeParse(input.understanding);
  if (!validation.success) {
    return {
      ok: false,
      error: "VALIDATION",
      message: "Understanding payload was invalid.",
      retryable: false,
    };
  }

  const understanding = validation.data as PlayUnderstanding;
  const rules = selectRulesForCandidates(understanding.candidate_rules);

  try {
    const verdict = await runStage5(
      understanding,
      input.original_call,
      input.original_call_freetext,
      rules
    );
    return { ok: true, verdict };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";

    if (
      message.includes("timeout") &&
      !message.includes("stage5") &&
      !message.includes("stage3")
    ) {
      return {
        ok: false,
        error: "MODEL_TIMEOUT",
        message:
          "The model took longer than expected on verdict synthesis. Please try again.",
        retryable: true,
      };
    }
    console.error("synthesizeVerdictAction failed:", err);
    const mapped = mapSynthesizeError(err);
    return {
      ok: false,
      error: "MODEL_ERROR",
      message: mapped.message,
      retryable: mapped.retryable,
    };
  }
}
