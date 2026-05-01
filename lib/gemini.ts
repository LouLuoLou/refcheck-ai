import type {
  BasketballCall,
  PlayUnderstanding,
  RuleEntry,
  VerdictResult,
} from "@/lib/types";
import { GEMINI_MODEL, getGeminiApiKey } from "@/lib/env";
import {
  CANDIDATE_RULE_TAGS,
  PlayUnderstandingSchema,
  VerdictResultSchema,
  tryParseJson,
  validateAndRepairVerdict,
} from "@/lib/validate";
import {
  STAGE3_SYSTEM_PROMPT,
  STAGE5_SYSTEM_PROMPT,
  buildStage3UserPrompt,
  buildStage5UserPrompt,
} from "@/lib/prompts";

const STAGE3_TIMEOUT_MS = 25_000;
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
  },
  required: [
    "verdict",
    "confidence_score",
    "confidence_label",
    "headline",
    "reasoning",
    "rule_citations",
    "counterfactual",
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
          { fileData: { fileUri: file.uri, mimeType: file.mimeType } },
          { text: userPrompt },
        ],
      },
    ],
    config: {
      systemInstruction: STAGE3_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: PLAY_UNDERSTANDING_RESPONSE_SCHEMA as never,
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  });

  const response = await withTimeout(call, STAGE3_TIMEOUT_MS, "stage3_timeout");
  const text = response.text ?? "";

  const raw = tryParseJson(text);
  const parsed = PlayUnderstandingSchema.parse(raw);
  return parsed satisfies PlayUnderstanding;
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
      maxOutputTokens: 2048,
    },
  });

  const response = await withTimeout(call, STAGE5_TIMEOUT_MS, "stage5_timeout");
  const text = response.text ?? "";

  const raw = tryParseJson(text);
  const parsed = VerdictResultSchema.parse(raw);

  return validateAndRepairVerdict(
    parsed,
    rules,
    originalCall,
    understanding.observable_contact
  );
}
