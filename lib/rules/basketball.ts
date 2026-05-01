import type { RuleEntry } from "@/lib/types";

const NBA_RULEBOOK_URL = "https://official.nba.com/rulebook/";

export const BASKETBALL_RULES: RuleEntry[] = [
  {
    id: "blocking_defender_position",
    tags: ["blocking_foul", "charge"],
    section: "Rule 12 §B.I.a",
    title: "Blocking — Defender position at contact",
    text: "A defender has obtained legal position when he has both feet on the floor and his torso is facing the opponent prior to the offensive player becoming airborne. Once a defender has established an initial legal position, he may move to maintain his defensive position, but he may not be moving toward the offensive player when contact occurs.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "offensive_charging",
    tags: ["charge", "offensive_foul"],
    section: "Rule 12 §B.I.c",
    title: "Offensive Charging — Illegal contact by offensive player",
    text: "An offensive player shall not charge into an opponent who has established a legal guarding position. Contact that is caused by an offensive player pushing off or lowering his shoulder, head, or knee into a defender who has established a legal position is an offensive foul.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "verticality",
    tags: ["verticality", "blocking_foul"],
    section: "Rule 12 §B.I.e",
    title: "Verticality — Right to a vertical plane",
    text: "A defender shall be entitled to a vertical position even extending his arms above his shoulders, as when shooting a shot or jumping. The offensive player, whether on the floor or airborne, may not clear out or prevent a defender from occupying his vertical plane. Any contact by an offensive player which is caused by the offensive player shall not be the responsibility of the defender.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "restricted_area_secondary_defender",
    tags: ["blocking_foul", "charge"],
    section: "Rule 12 §B.I.f",
    title: "Restricted Area — Secondary defender rule",
    text: "Any defensive player positioned in the 'restricted area' may not draw a charge in circumstances in which he is the secondary defender. If the contact occurs within the restricted area and the defender is not the primary defender, the play shall be called a blocking foul, unless the offensive player makes an unnatural basketball play.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "act_of_shooting",
    tags: ["shooting_foul"],
    section: "Rule 12 §B.II.a",
    title: "Act of Shooting — Continuous motion",
    text: "A player is in the act of shooting from the time he begins his habitual shooting motion until the ball leaves his hand. If the player has started his upward shooting motion when fouled, the act of shooting has begun and continuous motion applies.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "contact_on_shooter",
    tags: ["shooting_foul"],
    section: "Rule 12 §B.II.b",
    title: "Contact on a player in the act of shooting",
    text: "If a personal foul is committed against a player who is in the act of shooting, the shooter shall be awarded free throws if the shot is unsuccessful, or the goal shall count plus one free throw if the shot is successful.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "offensive_extension",
    tags: ["offensive_foul"],
    section: "Rule 12 §B.I.d",
    title: "Offensive foul — Illegal use of hands, arms, legs",
    text: "The offensive player shall not use his hands, forearms, or elbows to prevent an opponent from defending him, nor may he extend a leg or hip to dislodge a defender. Any such contact that disrupts a defender in a legal position is an offensive foul.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "traveling_gather",
    tags: ["traveling", "gather_step"],
    section: "Rule 10 §XIII.b",
    title: "Traveling — Gather step definition",
    text: "A player who gathers the ball while progressing may take two steps in coming to a stop, passing, or shooting. The gather is the point at which the player gains enough control of the ball to hold it, change hands, pass, shoot, or cradle it against his body. Upon gathering the ball, two legal steps are permitted.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "traveling_pivot",
    tags: ["traveling"],
    section: "Rule 10 §XIII.a",
    title: "Traveling — Pivot foot rules",
    text: "A player who receives the ball while standing still may pivot, using either foot as the pivot foot. A player who receives the ball while he is progressing or upon completion of a dribble may take two steps in coming to a stop, passing, or shooting. The pivot foot may not be lifted before the ball is released on a pass or shot.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "goaltending_downward",
    tags: ["goaltending"],
    section: "Rule 11 §I.a",
    title: "Goaltending — Ball on downward flight",
    text: "Goaltending occurs when a player touches the ball during a field goal attempt while the ball is on its downward flight, has a chance to score, and is entirely above the level of the ring. If the ball is not yet on its downward flight, the contact is legal.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "basket_interference",
    tags: ["basket_interference", "goaltending"],
    section: "Rule 11 §II.a",
    title: "Basket Interference — Touching ball within cylinder",
    text: "Basket interference occurs when a player touches the ball or any part of the basket while the ball is within the cylinder extending directly above the ring. No player may place a hand through the basket from below to touch the ball.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "oob_last_touched",
    tags: ["out_of_bounds"],
    section: "Rule 8 §III",
    title: "Out of Bounds — Last touched",
    text: "The ball is awarded to the team opposite the player who last touched the ball before it went out of bounds. If officials are in doubt about which team last touched the ball, a jump ball may be awarded.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "oob_player_position",
    tags: ["out_of_bounds"],
    section: "Rule 8 §II.a",
    title: "Out of Bounds — Player position",
    text: "A player is out of bounds when he touches the floor or any object on or outside the boundary line. The ball is out of bounds when it touches a player who is out of bounds, the floor or any object outside the boundary line, or the supports or back of the backboard.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "incidental_contact",
    tags: ["incidental_contact", "blocking_foul", "charge"],
    section: "Rule 12 §A.III",
    title: "Incidental contact — Not a foul",
    text: "Contact that is incidental in nature, does not affect the play, and does not provide either player an advantage is not a foul. Officials should use judgment in determining whether contact is incidental or warrants a foul call.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "illegal_screen",
    tags: ["illegal_screen", "offensive_foul"],
    section: "Rule 12 §B.I.h",
    title: "Illegal Screen — Screener position",
    text: "A screener must be stationary at the time of contact, except when he and the player being screened are moving in the same direction and at the same speed. A screener may not make contact with a defender who is not aware of his position or extend hips or limbs to impede the defender.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "offensive_three_seconds",
    tags: ["three_second_violation"],
    section: "Rule 10 §VII",
    title: "Three-Second Violation — Offensive",
    text: "An offensive player may not remain in the 16-foot lane for more than three consecutive seconds while his team is in control of the ball in the frontcourt. The count begins when the offensive team gains possession in the frontcourt and ends when a shot is attempted, the team loses possession, or the offensive player completely clears the lane.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "defensive_three_seconds",
    tags: ["defensive_three_seconds"],
    section: "Rule 10 §VIII",
    title: "Defensive Three Seconds — Illegal defense",
    text: "A defensive player must not remain in the 16-foot lane for more than three consecutive seconds unless he is actively guarding an offensive player. Active guarding requires being within an arm's length of the offensive player and in a defensive stance. The count is reset whenever the defender actively guards or steps out of the lane.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "five_second_inbound",
    tags: ["five_second_inbound"],
    section: "Rule 8 §IV",
    title: "Five-Second Inbound Violation",
    text: "A throw-in shall be awarded to the opposing team if the player taking the throw-in fails to release the ball within five seconds after the official has handed or placed it at his disposal. The count is enforced by the administering official and terminates as soon as the ball is released on the throw-in.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "backcourt_violation",
    tags: ["backcourt_violation"],
    section: "Rule 10 §IX",
    title: "Backcourt Violation — Over and back",
    text: "The offensive team shall not cause the ball to go from frontcourt to backcourt once the ball has established frontcourt status. The ball is in frontcourt when the ball and both feet of the player controlling it are entirely in the frontcourt. A backcourt violation results in loss of possession.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "flop",
    tags: ["flop", "offensive_foul"],
    section: "Rule 12 §VI (Respect for the Game)",
    title: "Flopping — Embellishment of contact",
    text: "A flop is any physical act that appears to have been intended to cause the officials to call a foul on another player when the act itself does not warrant such a call. Flopping is distinguished from a legitimate basketball play by an exaggerated falling or reaction that is inconsistent with the nature of the contact. Flopping is penalized with a warning on the first offense and monetary fines thereafter.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "delay_of_game",
    tags: ["delay_of_game"],
    section: "Rule 10 §II",
    title: "Delay of Game — Interfering with ball movement",
    text: "A delay-of-game warning shall be assessed to any team that unnecessarily prevents the ball from being promptly put into play after a made basket, violation, or timeout. Actions that constitute delay include touching the ball after a made basket, failing to immediately pass the ball to the nearest official following a violation, or any tactic intended to prevent a fast break.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "intentional_foul",
    tags: ["intentional_foul"],
    section: "Rule 12 §B.VII",
    title: "Intentional Foul — Contact away from play or not a legitimate basketball play",
    text: "A personal foul may be classified as intentional if the contact is deemed by officials to be deliberate, to be away from the ball, or to be not a legitimate attempt to play the ball or the player. Intentional fouls result in free throws plus possession of the ball to the offended team.",
    source_url: NBA_RULEBOOK_URL,
  },
  {
    id: "technical_foul",
    tags: ["technical_foul"],
    section: "Rule 12 §A.V",
    title: "Technical Foul — Unsportsmanlike conduct",
    text: "A technical foul may be assessed for unsportsmanlike conduct including but not limited to: disrespectfully addressing an official, attempting to influence an official's decision, using profanity, excessively demonstrative gestures, or any act which in the opinion of the officials brings discredit to the game. A technical foul results in one free throw for the opposing team and continued possession for the offended team.",
    source_url: NBA_RULEBOOK_URL,
  },
];

export function selectRulesForCandidates(
  candidateTags: string[]
): RuleEntry[] {
  if (candidateTags.length === 0) return [];
  const wanted = new Set(candidateTags);
  const hits: RuleEntry[] = [];
  for (const rule of BASKETBALL_RULES) {
    if (rule.tags.some((t) => wanted.has(t))) {
      hits.push(rule);
    }
  }
  return hits.slice(0, 6);
}

export function findRule(id: string): RuleEntry | undefined {
  return BASKETBALL_RULES.find((r) => r.id === id);
}
