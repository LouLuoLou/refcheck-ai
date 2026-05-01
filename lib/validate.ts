import { z } from "zod";
import type {
  BasketballCall,
  CandidateRuleTag,
  ConfidenceLabel,
  ObservableContact,
  PlayUnderstanding,
  PlayerRole,
  RuleEntry,
  Verdict,
  VerdictResult,
} from "@/lib/types";

export const CANDIDATE_RULE_TAGS = [
  "blocking_foul",
  "charge",
  "shooting_foul",
  "offensive_foul",
  "verticality",
  "traveling",
  "gather_step",
  "goaltending",
  "basket_interference",
  "out_of_bounds",
  "no_call",
  "incidental_contact",
  "illegal_screen",
  "three_second_violation",
  "defensive_three_seconds",
  "five_second_inbound",
  "backcourt_violation",
  "flop",
  "delay_of_game",
  "intentional_foul",
  "technical_foul",
] as const;

// Accepts anything Gemini might throw at us and snaps it to our controlled vocab.
const RULE_SYNONYMS: Record<string, CandidateRuleTag> = {
  blocking_foul: "blocking_foul",
  block: "blocking_foul",
  blocking: "blocking_foul",
  block_foul: "blocking_foul",
  defensive_foul: "blocking_foul",
  charge: "charge",
  charging: "charge",
  charging_foul: "charge",
  player_control_foul: "charge",
  offensive_charge: "charge",
  shooting_foul: "shooting_foul",
  shot_foul: "shooting_foul",
  and_one: "shooting_foul",
  offensive_foul: "offensive_foul",
  off_foul: "offensive_foul",
  verticality: "verticality",
  vertical_defense: "verticality",
  vertical_principle: "verticality",
  legal_guarding: "verticality",
  legal_guarding_position: "verticality",
  defensive_positioning: "verticality",
  defensive_position: "verticality",
  traveling: "traveling",
  travel: "traveling",
  walk: "traveling",
  steps: "traveling",
  gather_step: "gather_step",
  gather: "gather_step",
  euro_step: "gather_step",
  double_step: "gather_step",
  goaltending: "goaltending",
  goal_tending: "goaltending",
  goaltend: "goaltending",
  basket_interference: "basket_interference",
  basket_interference_offensive: "basket_interference",
  bi: "basket_interference",
  out_of_bounds: "out_of_bounds",
  out_bounds: "out_of_bounds",
  oob: "out_of_bounds",
  boundary: "out_of_bounds",
  no_call: "no_call",
  no_foul: "no_call",
  nothing: "no_call",
  clean: "no_call",
  incidental_contact: "incidental_contact",
  incidental: "incidental_contact",
  marginal_contact: "incidental_contact",
  illegal_screen: "illegal_screen",
  screen: "illegal_screen",
  moving_screen: "illegal_screen",
  pick: "illegal_screen",
  three_second_violation: "three_second_violation",
  three_seconds: "three_second_violation",
  three_second: "three_second_violation",
  offensive_three_seconds: "three_second_violation",
  lane_violation: "three_second_violation",
  defensive_three_seconds: "defensive_three_seconds",
  defensive_three: "defensive_three_seconds",
  defensive_3: "defensive_three_seconds",
  defensive_3_seconds: "defensive_three_seconds",
  illegal_defense: "defensive_three_seconds",
  five_second_inbound: "five_second_inbound",
  five_seconds: "five_second_inbound",
  five_second: "five_second_inbound",
  inbound_violation: "five_second_inbound",
  backcourt_violation: "backcourt_violation",
  backcourt: "backcourt_violation",
  over_and_back: "backcourt_violation",
  flop: "flop",
  flopping: "flop",
  embellishment: "flop",
  fake_foul: "flop",
  delay_of_game: "delay_of_game",
  delay: "delay_of_game",
  stall: "delay_of_game",
  intentional_foul: "intentional_foul",
  intentional: "intentional_foul",
  flagrant_one: "intentional_foul",
  off_ball_foul: "intentional_foul",
  technical_foul: "technical_foul",
  technical: "technical_foul",
  tech: "technical_foul",
  t_foul: "technical_foul",
};

function snapToCanonicalRule(raw: unknown): CandidateRuleTag | null {
  if (typeof raw !== "string") return null;
  const normalized = raw
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z_]/g, "");
  return RULE_SYNONYMS[normalized] ?? null;
}

const CONTACT_SYNONYMS: Record<string, ObservableContact> = {
  none: "none",
  no: "none",
  no_contact: "none",
  zero: "none",
  minimal: "incidental",
  minor: "incidental",
  mild: "incidental",
  light: "incidental",
  incidental: "incidental",
  moderate: "incidental",
  glancing: "incidental",
  significant: "significant",
  major: "significant",
  heavy: "significant",
  strong: "significant",
  clear: "significant",
  material: "significant",
  hard: "significant",
};

function coerceObservableContact(raw: unknown): ObservableContact {
  const v = String(raw ?? "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");
  return CONTACT_SYNONYMS[v] ?? "none";
}

const ROLE_SYNONYMS: Record<string, PlayerRole> = {
  offense: "offense",
  offensive: "offense",
  attacker: "offense",
  shooter: "offense",
  ballhandler: "offense",
  ball_handler: "offense",
  driver: "offense",
  defense: "defense",
  defender: "defense",
  defensive: "defense",
  official: "official",
  ref: "official",
  referee: "official",
  umpire: "official",
};

function coerceRole(raw: unknown): PlayerRole {
  const v = String(raw ?? "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");
  return ROLE_SYNONYMS[v] ?? "offense";
}

const VERDICT_SYNONYMS: Record<string, Verdict> = {
  fair_call: "FAIR_CALL",
  fair: "FAIR_CALL",
  good_call: "FAIR_CALL",
  correct: "FAIR_CALL",
  correct_call: "FAIR_CALL",
  bad_call: "BAD_CALL",
  bad: "BAD_CALL",
  wrong: "BAD_CALL",
  incorrect: "BAD_CALL",
  incorrect_call: "BAD_CALL",
  inconclusive: "INCONCLUSIVE",
  insufficient: "INCONCLUSIVE",
  unclear: "INCONCLUSIVE",
  indeterminate: "INCONCLUSIVE",
};

function coerceVerdict(raw: unknown): Verdict {
  const v = String(raw ?? "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");
  return VERDICT_SYNONYMS[v] ?? "INCONCLUSIVE";
}

function coerceConfidenceScore(raw: unknown): number {
  let n: number;
  if (typeof raw === "number") {
    n = raw;
  } else if (typeof raw === "string") {
    const parsed = parseFloat(raw);
    n = isNaN(parsed) ? 50 : parsed;
  } else {
    n = 50;
  }
  return Math.round(Math.max(0, Math.min(100, n)));
}

function coerceConfidenceLabel(raw: unknown): ConfidenceLabel {
  const v = String(raw ?? "").toLowerCase().trim();
  if (v.startsWith("h")) return "High";
  if (v.startsWith("m")) return "Medium";
  if (v.startsWith("l")) return "Low";
  return "Medium";
}

function coerceNullableUrl(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (s.length === 0 || s === "null" || s === "(none)") return null;
  try {
    new URL(s);
    return s;
  } catch {
    return null;
  }
}

// Preprocessor for a single key_event object. Accepts synonyms for the field
// names (event | description | action | label | text) and for the timestamp.
const KeyEventRaw = z.preprocess(
  (raw) => {
    if (!raw || typeof raw !== "object") return raw;
    const obj = raw as Record<string, unknown>;
    const eventRaw =
      obj.event ??
      obj.description ??
      obj.action ??
      obj.label ??
      obj.name ??
      obj.text ??
      "event";
    const tRaw = obj.t_seconds ?? obj.timestamp ?? obj.time ?? obj.time_seconds ?? obj.t ?? 0;
    const t = typeof tRaw === "number" ? tRaw : parseFloat(String(tRaw));
    return {
      t_seconds: Math.max(0, Math.min(120, isNaN(t) ? 0 : t)),
      event: String(eventRaw).trim().slice(0, 240) || "event",
    };
  },
  z.object({
    t_seconds: z.number().min(0).max(120),
    event: z.string().min(1).max(240),
  })
);

const PlayerInvolvedRaw = z.preprocess(
  (raw) => {
    if (!raw || typeof raw !== "object") return raw;
    const obj = raw as Record<string, unknown>;
    const action =
      obj.action ?? obj.description ?? obj.label ?? obj.note ?? "unknown";
    return {
      role: coerceRole(obj.role ?? obj.team ?? obj.side),
      action: String(action).trim().slice(0, 240) || "unknown",
    };
  },
  z.object({
    role: z.enum(["offense", "defense", "official"]),
    action: z.string().min(1).max(240),
  })
);

// Accepts ANY array of strings (or anything stringish), snaps each to the
// canonical enum, drops unknowns, dedupes. Defaults to ["no_call"] if nothing
// survives, so downstream rule selection always has something to work with.
const CandidateRulesRaw = z.preprocess(
  (raw) => {
    if (!Array.isArray(raw)) return ["no_call"];
    const mapped = raw
      .map(snapToCanonicalRule)
      .filter((x): x is CandidateRuleTag => x !== null);
    const unique = Array.from(new Set(mapped));
    return unique.length > 0 ? unique.slice(0, 8) : ["no_call"];
  },
  z.array(z.enum(CANDIDATE_RULE_TAGS)).min(1).max(8)
);

export const PlayUnderstandingSchema = z.object({
  play_description: z.preprocess(
    (raw) => String(raw ?? "").trim().slice(0, 2000) || "No description provided.",
    z.string().min(1).max(2000)
  ),
  key_events: z.preprocess(
    (raw) => (Array.isArray(raw) ? raw.slice(0, 16) : []),
    z.array(KeyEventRaw).max(16)
  ),
  players_involved: z.preprocess(
    (raw) => (Array.isArray(raw) ? raw.slice(0, 12) : []),
    z.array(PlayerInvolvedRaw).max(12)
  ),
  observable_contact: z.preprocess(
    coerceObservableContact,
    z.enum(["none", "incidental", "significant"])
  ),
  ambiguity_notes: z.preprocess(
    (raw) => String(raw ?? "").trim().slice(0, 1000),
    z.string().max(1000)
  ),
  candidate_rules: CandidateRulesRaw,
});

export type ParsedPlayUnderstanding = z.infer<typeof PlayUnderstandingSchema>;

const RuleCitationRawObject = z.object({
  rule_id: z.string().min(1).max(120),
  section: z.string().min(1).max(120),
  title: z.string().min(1).max(240),
  quote: z.string().min(1).max(1500),
  source_url: z.string().url().nullable(),
});

const RuleCitationRaw = z.preprocess((raw) => {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const rule_id = String(obj.rule_id ?? obj.id ?? "").trim();
  const section = String(obj.section ?? obj.section_number ?? "").trim();
  const title = String(obj.title ?? obj.name ?? "").trim();
  const quote = String(obj.quote ?? obj.text ?? obj.excerpt ?? "").trim();
  if (!rule_id || !section || !title || !quote) return null;
  return {
    rule_id: rule_id.slice(0, 120),
    section: section.slice(0, 120),
    title: title.slice(0, 240),
    quote: quote.slice(0, 1500),
    source_url: coerceNullableUrl(obj.source_url ?? obj.url),
  };
}, RuleCitationRawObject.nullable());

export const VerdictResultSchema = z.object({
  verdict: z.preprocess(coerceVerdict, z.enum(["FAIR_CALL", "BAD_CALL", "INCONCLUSIVE"])),
  confidence_score: z.preprocess(coerceConfidenceScore, z.number().int().min(0).max(100)),
  confidence_label: z.preprocess(coerceConfidenceLabel, z.enum(["Low", "Medium", "High"])),
  headline: z.preprocess(
    (raw) => String(raw ?? "").trim().slice(0, 300) || "Analysis complete.",
    z.string().min(1).max(300)
  ),
  reasoning: z.preprocess(
    (raw) => {
      const s = String(raw ?? "").trim().slice(0, 2000);
      return s.length >= 10 ? s : "The model did not provide sufficient reasoning for this play.";
    },
    z.string().min(10).max(2000)
  ),
  rule_citations: z
    .preprocess(
      (raw) => (Array.isArray(raw) ? raw : []),
      z.array(RuleCitationRaw).max(10)
    )
    .transform((arr) =>
      arr.filter((x): x is z.infer<typeof RuleCitationRawObject> => x !== null)
    ),
  counterfactual: z.preprocess(
    (raw) => String(raw ?? "").trim().slice(0, 500) || "Additional camera angles would help resolve this play.",
    z.string().min(1).max(500)
  ),
  counterargument: z.preprocess(
    (raw) =>
      String(raw ?? "").trim().slice(0, 500) ||
      "No clear counter-argument available from the visible evidence.",
    z.string().min(1).max(500)
  ),
});

export type ParsedVerdictResult = z.infer<typeof VerdictResultSchema>;

export const AnalyzeInputSchema = z.object({
  sport: z.literal("basketball"),
  original_call: z
    .enum([
      "blocking_foul",
      "charge",
      "shooting_foul",
      "offensive_foul",
      "traveling",
      "goaltending",
      "out_of_bounds",
      "no_call",
    ])
    .nullable(),
  original_call_freetext: z.string().max(240).nullable(),
});

export type ValidatedAnalyzeInput = z.infer<typeof AnalyzeInputSchema>;

const CONTACT_CALLS: BasketballCall[] = [
  "blocking_foul",
  "charge",
  "shooting_foul",
  "offensive_foul",
];

function labelForScore(score: number): ConfidenceLabel {
  if (score < 40) return "Low";
  if (score < 75) return "Medium";
  return "High";
}

function normalize(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Footwork / gather visibility gaps only. Avoid false positives on call narration
 * e.g. "officials whistled a blocking foul" (would match ref + "block" in "blocking").
 */
const FOOTWORK_OCCLUSION_PATTERNS: RegExp[] = [
  /\bobscur[^\n]{0,100}(?:feet|footwork|lower\s+body|legs|pivot|gather|step|steps|ball[- ]handler)/i,
  /(?:feet|footwork|pivot|gather|steps)[^\n]{0,100}\bobscur/i,
  /blocked\s+from\s+view[^\n]{0,70}(?:feet|footwork|pivot|gather|lower\s+body)/i,
  /blocked\s+by\s+(?:a\s+)?(?:the\s+)?(?:ref|refs|official|officials|referee|referees)\b/i,
  /behind\s+(?:a\s+)?(?:the\s+)?(?:ref|refs|official|officials|referee|referees)\b[^\n]{0,90}(?:feet|footwork|gather|pivot|step|lower\s+body)/i,
  /behind\s+(?:a\s+)?(?:the\s+)?(?:ref|refs|official|officials|referee|referees)\b[^\n]{0,50}(?:obscur|hidden|not\s+visible)/i,
  /cannot\s+see\s+(?:the\s+)?(?:feet|footwork|legs|lower\s+body)/i,
  /feet\s+not\s+visible|footwork\s+not\s+visible/i,
  /cannot\s+verify\s+(?:the\s+)?(?:footwork|feet|steps|pivot|gather)/i,
  /\bnot\s+continuously\s+visible\b[^\n]{0,60}(?:feet|foot|step|pivot|gather)/i,
  /off[- ]camera[^\n]{0,70}(?:feet|footwork|gather|pivot|step)/i,
  /limited\s+view\s+of\s+(?:the\s+)?(?:feet|footwork|lower)/i,
  /does\s+not\s+show\s+(?:the\s+)?(?:full\s+)?(?:step|steps|pivot|gather)/i,
  /lower\s+body\s+(?:is\s+)?(?:not|partially)(?:\s+visible)?/i,
  /unverified\s+footwork/i,
  /pivot[^\n]{0,45}(?:not\s+visible|obscur|hidden)/i,
  /gather[^\n]{0,45}(?:not\s+visible|obscur|hidden)/i,
  /(?:ref|refs|official|officials|referee|referees)\b[^\n]{0,55}\b(?:body\s+)?(?:blocks|obscures)\s+(?:the\s+)?(?:view\s+)?(?:of\s+)?(?:the\s+)?(?:feet|footwork|lower\s+body|ball[- ]handler)/i,
];

const FOOTWORK_REASONING_HINT =
  /footwork visibility|limited visibility of feet|cannot verify footwork|obscur.+feet|feet.+not.+visible|insufficient.+footwork/i;

function isTravelRelated(
  originalCall: BasketballCall | null,
  candidateRules: readonly CandidateRuleTag[]
): boolean {
  if (originalCall === "traveling") return true;
  return candidateRules.some((t) => t === "traveling" || t === "gather_step");
}

function textSuggestsFootworkOcclusion(
  ambiguityNotes: string,
  playDescription: string
): boolean {
  const text = `${ambiguityNotes}\n${playDescription}`;
  return FOOTWORK_OCCLUSION_PATTERNS.some((re) => re.test(text));
}

export function validateAndRepairVerdict(
  parsed: ParsedVerdictResult,
  providedRules: RuleEntry[],
  originalCall: BasketballCall | null,
  understanding: PlayUnderstanding
): VerdictResult {
  const rulesById = new Map(providedRules.map((r) => [r.id, r]));

  const validCitations = parsed.rule_citations.filter((c) => {
    const rule = rulesById.get(c.rule_id);
    if (!rule) return false;
    const haystack = normalize(rule.text);
    const needle = normalize(c.quote);
    if (!haystack.includes(needle)) return false;
    return true;
  });

  let verdict = parsed.verdict;
  let score = parsed.confidence_score;
  let reasoning = parsed.reasoning;

  if (verdict !== "INCONCLUSIVE" && validCitations.length === 0) {
    verdict = "INCONCLUSIVE";
    score = Math.min(score, 35);
    reasoning =
      "The available footage and the retrieved rulebook excerpts did not provide enough verbatim rule coverage to reach a confident verdict. A clearer angle or additional rule context would be required to resolve this play.";
  }

  const observableContact = understanding.observable_contact;

  if (
    isTravelRelated(originalCall, understanding.candidate_rules) &&
    textSuggestsFootworkOcclusion(
      understanding.ambiguity_notes,
      understanding.play_description
    )
  ) {
    const suffix =
      "Footwork visibility was limited in the observation; a definitive traveling verdict from this clip alone is not warranted.";
    if (verdict === "FAIR_CALL" || verdict === "BAD_CALL") {
      verdict = "INCONCLUSIVE";
      score = Math.min(score, 40);
      if (!FOOTWORK_REASONING_HINT.test(reasoning)) {
        reasoning = `${reasoning.trimEnd()} ${suffix}`.trim();
      }
    } else if (verdict === "INCONCLUSIVE") {
      score = Math.min(score, 45);
    }
  }

  if (
    observableContact === "none" &&
    originalCall &&
    CONTACT_CALLS.includes(originalCall)
  ) {
    score = Math.max(0, score - 20);
  }

  score = Math.round(Math.min(100, Math.max(0, score)));
  const label = labelForScore(score);

  return {
    verdict,
    confidence_score: score,
    confidence_label: label,
    headline: parsed.headline,
    reasoning,
    rule_citations: validCitations,
    counterfactual: parsed.counterfactual,
    counterargument: parsed.counterargument,
  };
}

export function tryParseJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch) {
      try {
        return JSON.parse(fenceMatch[1]);
      } catch {
        // fall through
      }
    }
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      try {
        return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
      } catch {
        // fall through
      }
    }
    throw new Error("Model response was not valid JSON.");
  }
}
