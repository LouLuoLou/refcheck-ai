import type { BasketballCall, PlayUnderstanding } from "@/lib/types";
import { runStage3, runStage3b, uploadVideoToGemini } from "@/lib/gemini";
import {
  enforceBallFlightFloor,
  reconcileContactEvents,
} from "@/lib/play-understanding-postprocess";

/**
 * Upload clip to Gemini Files, Stage 3 + optional 3b, then deterministic guardrails.
 * Throws the same errors as the former inline `describePlayAction` body.
 */
export async function runDescribeUploadPipeline(opts: {
  buffer: Buffer;
  mimeType: string;
  originalCall: BasketballCall | null;
  originalCallFreetext: string | null;
}): Promise<PlayUnderstanding> {
  const uploaded = await uploadVideoToGemini(
    opts.buffer,
    opts.mimeType
  );

  const roughUnderstanding = await runStage3(
    uploaded,
    opts.originalCall,
    opts.originalCallFreetext
  );

  let understanding = roughUnderstanding;
  try {
    understanding = await runStage3b(uploaded, roughUnderstanding);
  } catch (err) {
    console.warn(
      "Stage 3b refinement pass failed, using Stage 3 timings:",
      err instanceof Error ? err.message : err
    );
  }

  understanding = enforceBallFlightFloor(understanding);
  understanding = reconcileContactEvents(understanding);

  return understanding;
}
