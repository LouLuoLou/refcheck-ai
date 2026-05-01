import type { Sample, FullAnalysis } from "@/lib/types";
import { findRule } from "@/lib/rules/basketball";

function ruleCitationFromId(ruleId: string, quote: string) {
  const rule = findRule(ruleId);
  if (!rule) {
    throw new Error(`Unknown rule id: ${ruleId}`);
  }
  return {
    rule_id: rule.id,
    section: rule.section,
    title: rule.title,
    quote,
    source_url: rule.source_url,
  };
}

const baseCreatedAt = "2026-04-30T00:00:00.000Z";

const sampleA_prebaked: FullAnalysis = {
  id: "sample-a",
  sport: "basketball",
  original_call: "blocking_foul",
  original_call_freetext: null,
  video_url: "/samples/sample-a.mp4",
  is_sample: true,
  understanding: {
    play_description:
      "An offensive player drove along the right baseline toward the rim. A secondary defender slid from the weakside into the paint and made body contact with the driver just as the driver gathered for a layup. The defender was still in lateral motion at the moment of contact and was positioned inside the restricted area.",
    key_events: [
      { t_seconds: 1.2, event: "driver begins baseline attack" },
      { t_seconds: 2.4, event: "secondary defender slides into paint" },
      { t_seconds: 3.1, event: "contact: defender still moving laterally" },
      { t_seconds: 3.6, event: "officials signal blocking foul" },
    ],
    players_involved: [
      { role: "offense", action: "drives to rim, gathers for layup" },
      { role: "defense", action: "slides laterally into restricted area" },
      { role: "official", action: "signals personal foul on defender" },
    ],
    observable_contact: "significant",
    ambiguity_notes: "No significant ambiguity.",
    candidate_rules: ["blocking_foul", "charge"],
  },
  verdict: {
    verdict: "FAIR_CALL",
    confidence_score: 82,
    confidence_label: "High",
    headline:
      "Defender was moving laterally inside the restricted area — blocking foul stands.",
    reasoning:
      "The defender arrived at the point of contact while still moving laterally, which fails the legal guarding position standard. Under Rule 12 §B.I.a, a defender must not be moving toward the offensive player when contact occurs. Additionally, the contact took place inside the restricted area, where the secondary-defender rule (Rule 12 §B.I.f) disallows a charge regardless of position. The original blocking call is consistent with both standards.",
    rule_citations: [
      ruleCitationFromId(
        "blocking_defender_position",
        "he may not be moving toward the offensive player when contact occurs"
      ),
      ruleCitationFromId(
        "restricted_area_secondary_defender",
        "If the contact occurs within the restricted area and the defender is not the primary defender, the play shall be called a blocking foul"
      ),
    ],
    counterfactual:
      "If the defender had set both feet outside the restricted area before contact, the call would flip to a charge.",
    counterargument:
      "If the defender had actually beaten the driver to the spot a beat earlier, some officials would still accept the charge regardless of the restricted area.",
  },
  created_at: baseCreatedAt,
};

const sampleB_prebaked: FullAnalysis = {
  id: "sample-b",
  sport: "basketball",
  original_call: "blocking_foul",
  original_call_freetext: null,
  video_url: "/samples/sample-b.mp4",
  is_sample: true,
  understanding: {
    play_description:
      "An offensive player drove hard into the lane. A defender was set with both feet planted on the floor, torso squared toward the ball-handler, outside the restricted area. The offensive player lowered his shoulder into the defender's chest, causing the defender to fall. The officials whistled a blocking foul on the defender.",
    key_events: [
      { t_seconds: 1.0, event: "defender sets both feet" },
      { t_seconds: 1.8, event: "offensive player lowers shoulder" },
      { t_seconds: 2.1, event: "shoulder-first contact on chest" },
      { t_seconds: 2.4, event: "officials whistle blocking foul" },
    ],
    players_involved: [
      { role: "offense", action: "lowers shoulder into planted defender" },
      { role: "defense", action: "set, feet planted, torso square" },
      { role: "official", action: "signals personal foul on defender" },
    ],
    observable_contact: "significant",
    ambiguity_notes: "No significant ambiguity.",
    candidate_rules: ["blocking_foul", "charge", "offensive_foul"],
  },
  verdict: {
    verdict: "BAD_CALL",
    confidence_score: 78,
    confidence_label: "High",
    headline:
      "Defender had legal guarding position — this was a charge, not a block.",
    reasoning:
      "Under Rule 12 §B.I.a, the defender had established legal guarding position: both feet on the floor and torso squared prior to contact. The offensive player then lowered his shoulder into the defender — a textbook offensive charge under Rule 12 §B.I.c. The contact occurred outside the restricted area, so the secondary-defender exception does not apply. The blocking foul on the defender is inconsistent with both rules; this should have been called as a charge on the offensive player.",
    rule_citations: [
      ruleCitationFromId(
        "blocking_defender_position",
        "A defender has obtained legal position when he has both feet on the floor and his torso is facing the opponent prior to the offensive player becoming airborne"
      ),
      ruleCitationFromId(
        "offensive_charging",
        "Contact that is caused by an offensive player pushing off or lowering his shoulder, head, or knee into a defender who has established a legal position is an offensive foul"
      ),
    ],
    counterfactual:
      "If the defender had still been sliding laterally when the offensive player initiated contact, the block call would have stood.",
    counterargument:
      "A strict interpretation of 'avoiding contact is the offensive player's responsibility only when a defender is clearly set' could support the block if the defender's torso rotation isn't perfectly square in the final frame before contact.",
  },
  created_at: baseCreatedAt,
};

const sampleC_prebaked: FullAnalysis = {
  id: "sample-c",
  sport: "basketball",
  original_call: "goaltending",
  original_call_freetext: null,
  video_url: "/samples/sample-c.mp4",
  is_sample: true,
  understanding: {
    play_description:
      "A shooter released a floater near the rim. A rim-protecting defender rose and made contact with the ball near the plane of the rim. The camera angle is head-on with limited vertical perspective, making it difficult to determine whether the ball was on upward or downward flight at the moment of contact. Officials signaled goaltending.",
    key_events: [
      { t_seconds: 1.4, event: "shooter releases floater" },
      { t_seconds: 1.9, event: "defender rises to contest" },
      { t_seconds: 2.2, event: "hand makes contact with ball near rim" },
      { t_seconds: 2.6, event: "officials signal goaltending" },
    ],
    players_involved: [
      { role: "offense", action: "releases floater near the rim" },
      { role: "defense", action: "rises and touches ball near rim plane" },
      { role: "official", action: "signals goaltending violation" },
    ],
    observable_contact: "incidental",
    ambiguity_notes:
      "The head-on camera angle does not clearly show whether the ball was ascending or descending at the moment of contact.",
    candidate_rules: ["goaltending", "basket_interference"],
  },
  verdict: {
    verdict: "INCONCLUSIVE",
    confidence_score: 48,
    confidence_label: "Medium",
    headline: "Ball flight at contact is indeterminate from this angle.",
    reasoning:
      "Rule 11 §I.a defines goaltending as contact with the ball during a field goal attempt while the ball is on its downward flight. The provided angle is too flat to confirm whether the ball had reached its apex before contact. Without a side-angle view of the arc, neither the goaltending call nor a 'clean block' verdict can be supported with confidence. The contact was at the rim's plane, but that alone does not satisfy the downward-flight criterion.",
    rule_citations: [
      ruleCitationFromId(
        "goaltending_downward",
        "Goaltending occurs when a player touches the ball during a field goal attempt while the ball is on its downward flight"
      ),
    ],
    counterfactual:
      "A side-angle replay showing the ball's arc at the moment of contact would resolve this conclusively.",
    counterargument:
      "The ball being at the rim's plane at all could support goaltending under a strict reading — the downward-flight requirement is the only thing the angle fails to confirm.",
  },
  created_at: baseCreatedAt,
};

const sampleD_prebaked: FullAnalysis = {
  id: "sample-d",
  sport: "basketball",
  original_call: "traveling",
  original_call_freetext: null,
  video_url: "/samples/sample-d.mp4",
  is_sample: true,
  understanding: {
    play_description:
      "A ball-handler received a pass mid-stride while driving to the basket. After catching the ball, he took what appears to be three steps before rising for a shot. Officials whistled a traveling violation. Under modern NBA gather-step rules, the first movement after the catch counts as the gather, followed by two legal steps.",
    key_events: [
      { t_seconds: 0.9, event: "pass received mid-stride" },
      { t_seconds: 1.2, event: "gather step (legal)" },
      { t_seconds: 1.5, event: "first of two steps after gather" },
      { t_seconds: 1.8, event: "second step, rises for shot" },
      { t_seconds: 2.0, event: "officials signal traveling" },
    ],
    players_involved: [
      { role: "offense", action: "catches on the move, drives for shot" },
      { role: "official", action: "signals traveling violation" },
    ],
    observable_contact: "none",
    ambiguity_notes: "No significant ambiguity — the sequence is clear.",
    candidate_rules: ["traveling", "gather_step"],
  },
  verdict: {
    verdict: "BAD_CALL",
    confidence_score: 71,
    confidence_label: "Medium",
    headline: "What looks like an extra step is the legal gather — no travel.",
    reasoning:
      "Rule 10 §XIII.b permits a player who is progressing to take two steps after gathering the ball. The ball-handler's first movement after the catch qualifies as the gather step, not a travel. The two subsequent steps before the shot are legal under the NBA's modern gather-step definition. The whistle treated the gather as a third step, which does not align with the current rule text.",
    rule_citations: [
      ruleCitationFromId(
        "traveling_gather",
        "A player who gathers the ball while progressing may take two steps in coming to a stop, passing, or shooting"
      ),
    ],
    counterfactual:
      "If the player's pivot foot had lifted and returned to the floor before the shot was released, the travel call would stand.",
    counterargument:
      "Officials who learned the pre-gather-step era rules could reasonably count the first movement as the first step, making the three-step sequence a travel under the older interpretation.",
  },
  created_at: baseCreatedAt,
};

export const SAMPLES: Sample[] = [
  {
    id: "sample-a",
    filename: "sample-a.mp4",
    poster: "/samples/sample-a.svg",
    title: "The Driving Lane Collision",
    tagline: "Secondary defender slides into the restricted area.",
    duration_seconds: 6,
    original_call: "blocking_foul",
    prebaked: sampleA_prebaked,
  },
  {
    id: "sample-b",
    filename: "sample-b.mp4",
    poster: "/samples/sample-b.svg",
    title: "The Textbook Charge",
    tagline: "Defender set and square — shoulder-first contact.",
    duration_seconds: 5,
    original_call: "blocking_foul",
    prebaked: sampleB_prebaked,
  },
  {
    id: "sample-c",
    filename: "sample-c.mp4",
    poster: "/samples/sample-c.svg",
    title: "The Rim Protector",
    tagline: "Ball flight at contact — ambiguous angle.",
    duration_seconds: 5,
    original_call: "goaltending",
    prebaked: sampleC_prebaked,
  },
  {
    id: "sample-d",
    filename: "sample-d.mp4",
    poster: "/samples/sample-d.svg",
    title: "The Gather Step",
    tagline: "Extra step — or legal gather?",
    duration_seconds: 5,
    original_call: "traveling",
    prebaked: sampleD_prebaked,
  },
];

export function findSample(id: string): Sample | undefined {
  return SAMPLES.find((s) => s.id === id);
}
