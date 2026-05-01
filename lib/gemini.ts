import type {
  BasketballCall,
  PlayUnderstanding,
  RuleEntry,
  VerdictResult,
} from "@/lib/types";
import { GEMINI_MODEL, VIDEO_FPS, getGeminiApiKey } from "@/lib/env";
import {
  CANDIDATE_RULE_TAGS,
  PlayUnderstandingSchema,
  VerdictResultSchema,
  tryParseJson,
  validateAndRepairVerdict,
} from "@/lib/validate";
import {
  STAGE3_SYSTEM_PROMPT,
  STAGE3B_SYSTEM_PROMPT,
  STAGE5_SYSTEM_PROMPT,
  buildStage3UserPrompt,
  buildStage3bUserPrompt,
  buildStage5UserPrompt,
} from "@/lib/prompts";

const STAGE3_TIMEOUT_MS = 25_000;
const STAGE3B_TIMEOUT_MS = 8_000;
const STAGE5_TIMEOUT_MS = 20_000;
const FILE_ACTIVE_POLL_INTERVAL_MS = 900;
const FILE_ACTIVE_POLL_TIMEOUT_MS = 15_000;

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage = "timeout"
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(errorMessage)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function getClient() {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("missing_api_key");
  }
  const { GoogleGenAI } = await import("@google/genai");
  return new GoogleGenAI({ apiKey });
}

// Structured-output schemas. Gemini will constrain its JSON output to match
// these, which dramatically reduces the chance of field-name drift.
// Keys follow the OpenAPI-style shape the SDK expects.
const PLAY_UNDERSTANDING_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    play_description: { type: "STRING" },
    key_events: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          t_seconds: { type: "NUMBER" },
          event: { type: "STRING" },
        },
        required: ["t_seconds", "event"],
      },
    },
    players_involved: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          role: {
            type: "STRING",
            enum: ["offense", "defense", "official"],
          },
          action: { type: "STRING" },
        },
        required: ["role", "action"],
      },
    },
    observable_contact: {
      type: "STRING",
      enum: ["none", "incidental", "significant"],
    },
    ambiguity_notes: { type: "STRING" },
    candidate_rules: {
      type: "ARRAY",
      items: {
        type: "STRING",
        enum: [...CANDIDATE_RULE_TAGS],
      },
    },
  },
  required: [
    "play_description",
    "key_events",
    "players_involved",
    "observable_contact",
    "ambiguity_notes",
    "candidate_rules",
  ],
} as const;

const VERDICT_RESULT_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    verdict: {
      type: "STRING",
      enum: ["FAIR_CALL", "BAD_CALL", "INCONCLUSIVE"],
    },
    confidence_score: { type: "INTEGER" },
    confidence_label: {
      type: "STRING",
      enum: ["Low", "Medium", "High"],
    },
    headline: { type: "STRING" },
    reasoning: { type: "STRING" },
    rule_citations: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          rule_id: { type: "STRING" },
          section: { type: "STRING" },
          title: { type: "STRING" },
          quote: { type: "STRING" },
          source_url: { type: "STRING", nullable: true },
        },
        required: ["rule_id", "section", "title", "quote"],
      },
    },
    counterfactual: { type: "STRING" },
    counterargument: { type: "STRING" },
  },
  required: [
    "verdict",
    "confidence_score",
    "confidence_label",
    "headline",
    "reasoning",
    "rule_citations",
    "counterfactual",
    "counterargument",
  ],
} as const;

type UploadedFile = {
  uri: string;
  mimeType: string;
};

export async function uploadVideoToGemini(
  buffer: Buffer,
  mimeType: string
): Promise<UploadedFile> {
  const ai = await getClient();

  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });

  const uploaded = await ai.files.upload({
    file: blob,
    config: { mimeType },
  });

  let fileName = uploaded.name;
  let state = uploaded.state;
  let uri = uploaded.uri;
  let resolvedMime = uploaded.mimeType ?? mimeType;

  const start = Date.now();
  while (state === "PROCESSING") {
    if (Date.now() - start > FILE_ACTIVE_POLL_TIMEOUT_MS) {
      throw new Error("file_upload_timeout");
    }
    await new Promise((r) => setTimeout(r, FILE_ACTIVE_POLL_INTERVAL_MS));
    if (!fileName) throw new Error("file_upload_missing_name");
    const fresh = await ai.files.get({ name: fileName });
    state = fresh.state;
    uri = fresh.uri;
    resolvedMime = fresh.mimeType ?? resolvedMime;
    fileName = fresh.name ?? fileName;
  }

  if (state !== "ACTIVE" || !uri) {
    throw new Error("file_not_active");
  }

  return { uri, mimeType: resolvedMime };
}

export async function runStage3(
  file: UploadedFile,
  originalCall: BasketballCall | null,
  freetext: string | null
): Promise<PlayUnderstanding> {
  const ai = await getClient();

  const userPrompt = buildStage3UserPrompt(originalCall, freetext);

  const call = ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            fileData: { fileUri: file.uri, mimeType: file.mimeType },
            videoMetadata: { fps: VIDEO_FPS },
          },
          { text: userPrompt },
        ],
      },
    ],
    config: {
      systemInstruction: STAGE3_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: PLAY_UNDERSTANDING_RESPONSE_SCHEMA as never,
      temperature: 0.2,
      // Flash 2.5 uses thinking tokens by default that count against this cap;
      // with 2 FPS video the thinking budget can truncate the JSON body.
      // Bumping to 4096 keeps us safe with plenty of headroom.
      maxOutputTokens: 4096,
    },
  });

  const response = await withTimeout(call, STAGE3_TIMEOUT_MS, "stage3_timeout");
  const text = response.text ?? "";

  let raw: unknown;
  try {
    raw = tryParseJson(text);
  } catch (err) {
    const finishReason =
      response.candidates?.[0]?.finishReason ?? "unknown";
    console.error(
      `[Stage 3] JSON parse failed. finishReason=${finishReason} textLength=${text.length} preview=${JSON.stringify(text.slice(0, 300))}`
    );
    throw err;
  }
  const parsed = PlayUnderstandingSchema.parse(raw);
  return parsed satisfies PlayUnderstanding;
}

// Schema the refinement pass returns: ONLY the sharpened key_events array,
// matching the same shape Stage 3 emits so we can merge it back in.
const STAGE3B_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    key_events: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          t_seconds: { type: "NUMBER" },
          event: { type: "STRING" },
        },
        required: ["t_seconds", "event"],
      },
    },
  },
  required: ["key_events"],
} as const;

// Second-pass timing refinement. Given the rough events from Stage 3, ask the
// model to re-watch the clip and tighten each t_seconds to 0.1s precision
// without reordering, renaming, or adding/removing events. Throws on any
// failure — caller is responsible for falling back to Stage 3 output.
export async function runStage3b(
  file: UploadedFile,
  understanding: PlayUnderstanding
): Promise<PlayUnderstanding> {
  if (understanding.key_events.length === 0) return understanding;

  const ai = await getClient();
  const userPrompt = buildStage3bUserPrompt(understanding.key_events);

  const call = ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            fileData: { fileUri: file.uri, mimeType: file.mimeType },
            videoMetadata: { fps: VIDEO_FPS },
          },
          { text: userPrompt },
        ],
      },
    ],
    config: {
      systemInstruction: STAGE3B_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: STAGE3B_RESPONSE_SCHEMA as never,
      temperature: 0.1,
      maxOutputTokens: 2048,
    },
  });

  const response = await withTimeout(call, STAGE3B_TIMEOUT_MS, "stage3b_timeout");
  const text = response.text ?? "";
  const raw = tryParseJson(text);

  const parsed = raw as { key_events?: Array<{ t_seconds: unknown; event: unknown }> };
  if (!parsed || !Array.isArray(parsed.key_events)) {
    throw new Error("stage3b_invalid_response");
  }

  const refined = parsed.key_events.map((e, i) => {
    const tRaw = e?.t_seconds;
    const t = typeof tRaw === "number" ? tRaw : parseFloat(String(tRaw ?? 0));
    const eventName = String(e?.event ?? understanding.key_events[i]?.event ?? "event");
    return {
      t_seconds: Math.max(0, Math.min(120, isNaN(t) ? 0 : t)),
      event: eventName.trim().slice(0, 240) || "event",
    };
  });

  // Only accept if count matches Stage 3 exactly — prevents the model from
  // silently dropping or adding events during refinement.
  if (refined.length !== understanding.key_events.length) {
    throw new Error("stage3b_event_count_mismatch");
  }

  return {
    ...understanding,
    key_events: refined,
  };
}

export async function runStage5(
  understanding: PlayUnderstanding,
  originalCall: BasketballCall | null,
  freetext: string | null,
  rules: RuleEntry[]
): Promise<VerdictResult> {
  const ai = await getClient();

  const userPrompt = buildStage5UserPrompt(
    understanding,
    originalCall,
    freetext,
    rules
  );

  const call = ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    config: {
      systemInstruction: STAGE5_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: VERDICT_RESULT_RESPONSE_SCHEMA as never,
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  });

  const response = await withTimeout(call, STAGE5_TIMEOUT_MS, "stage5_timeout");
  const text = response.text ?? "";

  let raw: unknown;
  try {
    raw = tryParseJson(text);
  } catch (err) {
    const finishReason =
      response.candidates?.[0]?.finishReason ?? "unknown";
    console.error(
      `[Stage 5] JSON parse failed. finishReason=${finishReason} textLength=${text.length} preview=${JSON.stringify(text.slice(0, 300))}`
    );
    throw err;
  }
  const parsed = VerdictResultSchema.parse(raw);

  return validateAndRepairVerdict(parsed, rules, originalCall, understanding);
}
