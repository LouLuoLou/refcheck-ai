# QA-CHEATSHEET.md — Judge questions, crisp answers

Ten questions the judges are most likely to ask, in rough order of likelihood, with a one-paragraph answer each. Practice saying each one aloud before the demo. If a judge asks something not on this list, take a breath and answer from `STUDY.md`.

---

### 1. Why Gemini instead of OpenAI or Claude?

Gemini 2.5 Pro natively ingests video files through the Files API — OpenAI and Claude both require us to extract frames first, which adds a whole ffmpeg pipeline and serverless complexity we didn't want to pay for in a 24-hour build. And since this is a GDG-sponsored hackathon, building on Google's platform is both a technical and a strategic choice. The model also has strong JSON-mode compliance, which is critical for the structured output our pipeline depends on.

---

### 2. How do you stop the AI from making up rules?

Every rule quote we display has to appear **verbatim** in a small, curated TypeScript file of real NBA rulebook excerpts — `lib/rules/basketball.ts`. Before the verdict renders, the server runs `validateAndRepairVerdict`: it takes every citation the model produced and checks whether the `quote` is a substring of the rule's `text` field. Any citation that fails is stripped. If a Fair or Bad verdict ends up with zero valid citations, we automatically downgrade it to Inconclusive with a templated reasoning. The model cannot get a hallucinated rule onto the verdict card.

---

### 3. Why no vector database or RAG?

Our scoped NBA rule set — six call types, fifteen excerpts — is about four thousand tokens. It fits directly in the model's context. Adding RAG would introduce retrieval latency and mis-retrieval risk for a corpus that's small enough to just include in full. We use a simpler, deterministic keyword match on controlled vocabulary tags (`blocking_foul`, `charge`, `verticality`, etc.) that Stage 3 returns. When we scale to multiple sports, each sport still stays under a few thousand tokens of scoped rules, so the same architecture holds.

---

### 4. How accurate is it, really?

On visually clear plays — a textbook charge, a sliding defender, an obvious gather — it is directionally right. On genuinely ambiguous plays it returns **Inconclusive** on purpose. That's not a failure; that's the safest behavior for a tool that only sees one camera angle. Our goal wasn't superhuman officiating, it was a rulebook-grounded reasoning layer fans and coaches can check their instincts against. Every verdict also includes a "what would flip it" counterfactual, which is the single most honest thing an AI officiating tool can say.

---

### 5. What happens if someone uploads something that isn't basketball?

Stage 3 returns an empty `candidate_rules` array and `observable_contact: "none"`. Our post-validator sees no candidate rules matched and downgrades the verdict to Inconclusive with low confidence. The user sees _"The available footage and rulebook excerpts did not provide enough verbatim rule coverage to reach a confident verdict."_ No false Fair or Bad verdicts get through, even on garbage input.

---

### 6. How would you add more sports?

Drop a new file at `lib/rules/<sport>.ts` with the same `RuleEntry[]` shape, extend the `CandidateRuleTag` union with that sport's rule tags, add a prompt pack in `lib/prompts.ts`, and wire the sport pill on the analyze page. The Gemini pipeline itself is sport-agnostic — only the rule text and the prompt system-instructions change. The sport pill UI already hints at "Soccer — coming soon" and "Football — coming soon" to show the product is structured for that.

---

### 7. What about identifying the officiating crew?

That's our stretch goal, sketched on the About page under "Coming soon." The plan: user provides the game date and the two teams, we query a public box-score source — ESPN, basketball-reference, or a free sports API — scrape the officials listed, and surface them on the verdict page. Over time that becomes a dataset: referee accountability, performance tracking, and league-by-league comparison. We didn't build it in v1 because it's a separate data-plumbing problem and the bounty rewarded depth on the core verdict engine.

---

### 8. What is the hardest limitation right now?

Single camera angle. Many real-life calls — goaltending, block/charge on a fast drive, whether a player's pivot foot moved — are only resolvable with a second angle. That's why our verdict page always shows a counterfactual sentence: it tells the user what piece of additional evidence would flip the answer. Acknowledging that up front is more honest than pretending an AI can outperform official replay review from one perspective.

---

### 9. What's the business case?

Three directions. First, **fan engagement apps** — sports media, betting, fantasy — where "was the call fair?" is already a high-volume argument. Second, **league officiating review tools** and referee training programs, where getting a second opinion backed by the actual rulebook is a real workflow. Third, **amateur and youth officiating**, where most refs work without any replay or review infrastructure and would benefit hugely from a phone-camera-plus-rulebook check. Our defensible moat is the curated rulebook indexing and the verdict integrity validator, not the base model.

---

### 10. What would you build next, given time and budget?

A multi-angle uploader, so the user can submit two or three clips of the same play and we reason across them. A larger, fully-audited rulebook index (all NBA fouls, not just the scoped six). Officiating crew identification. And a referee "scorecard" view that aggregates verdicts over time. The core pipeline — observe, retrieve, synthesize, validate — does not change. Everything else is data and UI on top of it.
