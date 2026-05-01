"use server";

import type {
  BasketballCall,
  DescribePlayResult,
  PlayUnderstanding,
} from "@/lib/types";
import { AnalyzeInputSchema } from "@/lib/validate";
import { hasGeminiKey } from "@/lib/env";
import { runStage3, runStage3b, uploadVideoToGemini } from "@/lib/gemini";

const ACCEPTED_MIMES = new Set(["video/mp4", "video/quicktime", "video/webm"]);
const MAX_BYTES = 10 * 1024 * 1024;

// Deterministic post-processor. Even with prompt tightening + Stage 3b,
// Gemini sometimes places "ball enters net" at or near the release frame.
// Physics says there's always a non-trivial ball-flight time between the
// release and the make, so we enforce a minimum gap server-side. This runs
// regardless of whether Stage 3b succeeded.
const MAKE_PATTERN = /enters net|through net|scores|makes (the )?shot|ball in basket/i;
const RELEASE_PATTERN =
  /releases? shot|shoots|shot release|jumper|jump shot|layup|dunk|floater/i;
const MIN_BALL_FLIGHT_SECONDS = 0.6;
const PUSHED_GAP_SECONDS = 0.9;

function snap(t: number): number {
  return Math.round(t * 10) / 10;
}

// When the model reports observable_contact === "none" but slips "contact"
// language into a key_events entry, overwrite the event string so the UI
// can't contradict itself. Timestamps are preserved.
const CONTACT_WORD_PATTERN =
  /\bcontact|\bhits?\b|\bbumps?\b|\bfouls?\b|\bcollides?|\bstrikes?\b/i;

function reconcileContactEvents(
  understanding: PlayUnderstanding
): PlayUnderstanding {
  if (understanding.observable_contact !== "none") return understanding;
  const events = understanding.key_events;
  if (!Array.isArray(events) || events.length === 0) return understanding;

  const patched = events.map((e) =>
    CONTACT_WORD_PATTERN.test(e.event)
      ? { ...e, event: "contests shot" }
      : e
  );
  return { ...understanding, key_events: patched };
}

function enforceBallFlightFloor(
  understanding: PlayUnderstanding
): PlayUnderstanding {
  const events = understanding.key_events;
  if (!Array.isArray(events) || events.length === 0) return understanding;

  const patched = events.map((e) => ({ ...e }));
  const maxT = patched.reduce(
    (max, e) => (e.t_seconds > max ? e.t_seconds : max),
    0
  );
  const ceiling = Math.max(maxT + 2, 120);

  for (let i = 0; i < patched.length; i++) {
    const ev = patched[i];
    if (!MAKE_PATTERN.test(ev.event)) continue;

    let releaseIdx = -1;
    for (let j = i - 1; j >= 0; j--) {
      if (RELEASE_PATTERN.test(patched[j].event)) {
        releaseIdx = j;
        break;
      }
    }
    if (releaseIdx === -1) continue;

    const release = patched[releaseIdx];
    const gap = ev.t_seconds - release.t_seconds;
    if (gap < MIN_BALL_FLIGHT_SECONDS) {
      const pushed = Math.min(
        ceiling,
        release.t_seconds + PUSHED_GAP_SECONDS
      );
      patched[i] = { ...ev, t_seconds: snap(pushed) };
    }
  }

  return { ...understanding, key_events: patched };
}

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

    const roughUnderstanding = await runStage3(
      uploaded,
      validation.data.original_call as BasketballCall | null,
      validation.data.original_call_freetext
    );

    // Best-effort second-pass timestamp refinement. Any failure here is
    // non-fatal — we always fall back to the Stage 3 output.
    let understanding = roughUnderstanding;
    try {
      understanding = await runStage3b(uploaded, roughUnderstanding);
    } catch (err) {
      console.warn(
        "Stage 3b refinement pass failed, using Stage 3 timings:",
        err instanceof Error ? err.message : err
      );
    }

    // Final deterministic guardrails. Both run unconditionally after
    // Stage 3b so the UI never shows contact that contradicts the stated
    // observable_contact, and never shows a "ball enters net" that sits on
    // the release frame.
    understanding = enforceBallFlightFloor(understanding);
    understanding = reconcileContactEvents(understanding);

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
          "The model took longer than expected. Try again with the same clip or a shorter segment.",
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
        "Something went wrong analyzing that clip. Try again, or upload a different file.",
      retryable: true,
    };
  }
}
