# PLAN.md — Condensed build plan (for reference)

This is the single-page reference version of the full plan we built against. The exhaustive version lives in the chat history that produced this project.

## North star

Judges watching the ~2-minute demo should feel, in order:
1. "That's a real, useful product."
2. "It actually analyzed the play."
3. "I want to try it."

Every decision serves those three beats.

## Scope

- **Sport:** basketball only. Scoped to block/charge, shooting fouls, offensive fouls, traveling, goaltending, out-of-bounds.
- **Sample library:** 4 curated clips with pre-baked verdicts as a failsafe.
- **User uploads:** ≤ 20 s, ≤ 10 MB, mp4/mov/webm.
- **AI:** Google Gemini 2.5 Pro via `@google/genai`.
- **Persistence:** sessionStorage only. No database.
- **Host target:** Vercel (to be decided separately).

## Architecture

See `/about` in the app for the diagram. In words:

```
Browser → describePlayAction (server) → Gemini Files API + Stage 3
                                       ← PlayUnderstanding
        → synthesizeVerdictAction (server) → Stage 5 with curated rules
                                           → validateAndRepairVerdict
                                           ← VerdictResult
Browser ← Verdict page ← sessionStorage
```

Two Gemini calls:
- **Stage 3 — observation.** Neutral play description. Never outputs a verdict.
- **Stage 5 — synthesis.** Sees observation + verbatim rule excerpts. Must cite verbatim.

Server-side `validateAndRepairVerdict` strips any citation whose `quote` is not a substring of the named rule's `text`. Downgrades to Inconclusive if nothing valid remains.

## Hard requirements (bounty checklist)

- [x] Accepts short video clips (upload + sample library)
- [x] Real multimodal AI analysis via Gemini 2.5 Pro
- [x] Rule-based reasoning citing the NBA rulebook verbatim
- [x] Returns Fair / Bad / Inconclusive with confidence
- [x] Clean, modern, presentation-grade UI
- [x] Explainable pipeline (About page + open-source code)
- [x] Graceful failure handling (timeouts, retry, pre-baked fallback)

## Files that matter most

| What | Where |
|---|---|
| Pipeline wiring | `actions/describe-play.ts`, `actions/synthesize-verdict.ts` |
| Gemini SDK usage | `lib/gemini.ts` |
| System prompts | `lib/prompts.ts` |
| Schemas + validation | `lib/validate.ts` |
| Rulebook | `lib/rules/basketball.ts` |
| Sample data + pre-baked verdicts | `lib/samples.ts` |
| Analyze page orchestrator | `components/analyze-form.tsx` |
| Theater | `components/analysis-theater.tsx` |
| Verdict page | `components/verdict-client.tsx` |

## What to cut under time pressure

Never cut: the four sample clips, pre-baked fallback, verdict reveal motion, verbatim citation validator.

Can cut: history list on analyze page; frames strip; presenter shortcuts beyond Shift+D and F; grain overlay.

## Timeline (24h)

M0 scaffold → M1 landing → M2 analyze → M3 pipeline → M4 verdict → M5 demo mode → M6 about → M7 polish → M8 docs → M9 rehearsal → deploy.

## Team

See `ROLES.md`. Three-way split: UI Lead, AI Lead, Content + Pitch Lead. No serialization allowed.
