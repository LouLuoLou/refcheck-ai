export type Sport = "basketball";

export type BasketballCall =
  | "blocking_foul"
  | "charge"
  | "shooting_foul"
  | "offensive_foul"
  | "traveling"
  | "goaltending"
  | "out_of_bounds"
  | "no_call";

export const BASKETBALL_CALL_LABELS: Record<BasketballCall, string> = {
  blocking_foul: "Blocking foul",
  charge: "Charge",
  shooting_foul: "Shooting foul",
  offensive_foul: "Offensive foul",
  traveling: "Traveling",
  goaltending: "Goaltending",
  out_of_bounds: "Out of bounds",
  no_call: "No call",
};

export type Verdict = "FAIR_CALL" | "BAD_CALL" | "INCONCLUSIVE";

export type ConfidenceLabel = "Low" | "Medium" | "High";

export type ObservableContact = "none" | "incidental" | "significant";

export type PlayerRole = "offense" | "defense" | "official";

export type CandidateRuleTag =
  | "blocking_foul"
  | "charge"
  | "shooting_foul"
  | "offensive_foul"
  | "verticality"
  | "traveling"
  | "gather_step"
  | "goaltending"
  | "basket_interference"
  | "out_of_bounds"
  | "no_call"
  | "incidental_contact"
  | "illegal_screen";

export type KeyEvent = {
  t_seconds: number;
  event: string;
};

export type PlayerInvolved = {
  role: PlayerRole;
  action: string;
};

export type PlayUnderstanding = {
  play_description: string;
  key_events: KeyEvent[];
  players_involved: PlayerInvolved[];
  observable_contact: ObservableContact;
  ambiguity_notes: string;
  candidate_rules: CandidateRuleTag[];
};

export type RuleEntry = {
  id: string;
  tags: CandidateRuleTag[];
  section: string;
  title: string;
  text: string;
  source_url: string;
};

export type RuleCitation = {
  rule_id: string;
  section: string;
  title: string;
  quote: string;
  source_url: string | null;
};

export type VerdictResult = {
  verdict: Verdict;
  confidence_score: number;
  confidence_label: ConfidenceLabel;
  headline: string;
  reasoning: string;
  rule_citations: RuleCitation[];
  counterfactual: string;
};

export type AnalysisStage =
  | "idle"
  | "uploading"
  | "understanding"
  | "consulting_rulebook"
  | "rendering_verdict"
  | "complete"
  | "error";

export type FullAnalysis = {
  id: string;
  sport: Sport;
  original_call: BasketballCall | null;
  original_call_freetext: string | null;
  video_url: string;
  is_sample: boolean;
  understanding: PlayUnderstanding;
  verdict: VerdictResult;
  created_at: string;
};

export type Sample = {
  id: string;
  filename: string;
  poster: string;
  title: string;
  tagline: string;
  duration_seconds: number;
  original_call: BasketballCall | null;
  prebaked: FullAnalysis;
};

export type ServerActionError = {
  error:
    | "VALIDATION"
    | "UPLOAD_FAILED"
    | "MODEL_TIMEOUT"
    | "MODEL_ERROR"
    | "PARSE_FAILED";
  message: string;
  retryable: boolean;
};

export type DescribePlayResult =
  | {
      ok: true;
      analysisId: string;
      understanding: PlayUnderstanding;
    }
  | ({ ok: false } & ServerActionError);

export type SynthesizeVerdictResult =
  | {
      ok: true;
      verdict: VerdictResult;
    }
  | ({ ok: false } & ServerActionError);
