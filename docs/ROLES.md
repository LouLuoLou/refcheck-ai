# ROLES.md — Team of 3 split

Three people can work in parallel from hour 1 if roles stay in their lane. This document is the source of truth for who owns what.

## Role A — UI Lead

**Owns:** every `components/` file that isn't server-side pipeline or pipeline-adjacent.

Specifically:
- Landing (`hero-cinematic.tsx`, `how-it-works-row.tsx`, `landing-verdict-teaser.tsx`)
- Nav + footer (`site-nav.tsx`, `site-footer.tsx`, `system-status-dot.tsx`)
- Analyze page chrome (`sport-picker.tsx`, `sample-library.tsx`, `sample-card.tsx`, `video-dropzone.tsx`, `call-input.tsx`, `history-list.tsx`)
- Theater (`analysis-theater.tsx`) — the visual shell; Role B wires it to actions
- Verdict page (`verdict-client.tsx`, `verdict-badge.tsx`, `confidence-meter.tsx`, `rule-citation-card.tsx`, `reasoning-block.tsx`, `counterfactual-note.tsx`, `key-events-timeline.tsx`)
- Presenter surface (`presenter-shell.tsx`, `presenter-hud.tsx`, `shortcuts-dialog.tsx`)
- Architecture diagram on About
- Design tokens in `app/globals.css`
- shadcn primitives in `components/ui/`

**Per-milestone ownership:**

| Milestone | Role A contribution |
|---|---|
| M0 | Tailwind v4, fonts, design tokens, root layout |
| M1 | Landing page + nav + footer |
| M2 | Analyze page layout + sport picker + dropzone + call input + sample card visuals |
| M3 | AnalysisTheater visual shell |
| M4 | Verdict page split layout + motion reveal + all sub-components |
| M5 | PresenterHUD + ShortcutsDialog + presenter-mode styles |
| M6 | About page + architecture diagram |
| M7 | Polish pass — grain, hairlines, empty states, a11y |

## Role B — AI / Backend Lead

**Owns:** every `actions/` file, every `lib/` file that touches data or model, every `app/api/` route.

Specifically:
- `lib/gemini.ts` — client init, `uploadVideoToGemini`, `runStage3`, `runStage5`, timeouts
- `lib/prompts.ts` — the two system prompts + builders
- `lib/validate.ts` — zod schemas, `validateAndRepairVerdict`, `tryParseJson`
- `lib/env.ts`, `lib/types.ts`, `lib/session.ts`, `lib/utils.ts`
- `actions/describe-play.ts`, `actions/synthesize-verdict.ts`
- `app/api/health/route.ts`

**Per-milestone ownership:**

| Milestone | Role B contribution |
|---|---|
| M0 | `/api/health` route, `lib/env.ts`, `lib/types.ts`, server-action body size limit in `next.config.ts` |
| M1 | Scaffold `lib/gemini.ts` and `lib/validate.ts` |
| M2 | Stage 3 system prompt + zod schema + prompt builder |
| M3 | Full pipeline: server actions, Stage 3, Stage 4, Stage 5, post-validation |
| M4 | Refinements to verdict shape + post-validator as needed |
| M5 | Wire demo mode fallback paths if they touch `lib/` |
| M6 | Nothing major — stay on standby for bugs |
| M7 | Error state copy, timeout tuning, final failsafe drill |

## Role C — Content + Pitch Lead

**Owns:** everything the judges read or hear. Content, not code (with two exceptions in `lib/`).

Specifically:
- Sourcing the four sample clips into `public/samples/` as MP4s ≤ 20s ≤ 10 MB
- `lib/rules/basketball.ts` — the 15 NBA rule excerpts, verbatim from the official rulebook
- `lib/samples.ts` — the pre-baked verdict objects for each sample (copy-editing, not architecture)
- Every string the user sees — hero, CTAs, empty states, verdict templates
- The About page copy
- `docs/DEMO-SCRIPT.md` — the 120-second script (this file)
- `docs/QA-CHEATSHEET.md`
- `docs/STUDY.md`
- Screenshot session for pitch slides

**Per-milestone ownership:**

| Milestone | Role C contribution |
|---|---|
| M0 | Review `.env.local.example`, README outline |
| M1 | Source clips into `/public/samples/`. Start drafting `lib/rules/basketball.ts`. |
| M2 | Finish all 15 entries in `lib/rules/basketball.ts`. Draft pre-baked verdicts in `lib/samples.ts`. |
| M3 | Copy-edit theater stage captions. Validate pre-baked verdicts against post-validator (every quote must be a verbatim substring of the matching rule text). |
| M4 | Full pass on all user-facing strings. Finalize pre-baked verdicts. |
| M5 | Draft `DEMO-SCRIPT.md`. Rehearse with UI Lead. |
| M6 | Write About page copy. Proof every limitation bullet. |
| M7 | Final copy pass — every headline, placeholder, empty state, error message. |
| M8 | Finalize `STUDY.md`, `QA-CHEATSHEET.md`, `DEMO-SCRIPT.md`, `ROLES.md`. Capture screenshots on the verdict page for slides. |
| M9 | Lead the three rehearsal run-throughs. |

## Coordination rules

- **One commit = one concern.** Do not mix UI work and pipeline work in the same commit.
- **Role A merges UI PRs. Role B merges pipeline PRs. Role C merges content PRs.** If a file is ambiguous (e.g., `analysis-theater.tsx`), the owner asks the other two for a quick review.
- **Blockers go in the shared chat with `@BLOCKER`** and the current milestone tag. Any of the three can unblock.
- **Sleep plan:** plan at least four hours of sleep, staggered. Someone is always awake enough to debug at 4am.
- **The North Star trumps individual preferences.** If any decision doesn't help the demo or the verdict quality, cut it.
