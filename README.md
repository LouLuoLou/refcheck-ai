# RefCheck AI

> AI-powered officiating review, grounded in the official NBA rulebook.
> Built for the GDG BorderHack 2026 $2,000 bounty challenge.

**Was it a fair call?** Upload a short basketball clip (or pick a curated sample), and RefCheck AI watches the play with Google Gemini, cross-references the NBA rulebook verbatim, and returns a cited verdict: **Fair**, **Bad**, or **Inconclusive**.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Add your Gemini key
cp .env.local.example .env.local
# then edit .env.local and set GEMINI_API_KEY=...

# 3. Run the dev server
npm run dev
# open http://localhost:3000
```

**Video input:** Upload MP4/MOV/WEBM up to 40 MB. On `/analyze`, there’s a shortcut link to [Y2Mate](https://y2mate.ws/) if you need to save a YouTube clip as an MP4 elsewhere first (third‑party site — only use it where copyright/platform rules allow). Clips longer than **10 seconds** open an in-browser trimmer (powered by `@ffmpeg/ffmpeg`) so you can pick a window of up to **10 seconds** before analysis.

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey). The free tier works for testing; add billing for higher rate limits during a live demo.

## The experience

- `/` — landing page with hero, how-it-works, and verdict preview.
- `/analyze` — sport picker, 4 curated sample plays, upload dropzone, call input, session history.
- `/analyze/[id]` — verdict page with split layout, video + key-event timeline, verdict card, rule citations, counterfactual.
- `/about` — pipeline diagram, limitations, stack, roadmap.
- `/api/health` — returns `{ ok, model, timestamp }` after a trivial Gemini ping.

## Presenter / demo mode

| Key | Action |
|---|---|
| Shift+D | Toggle demo mode |
| P | Toggle presenter mode (larger type) |
| ← / → | Cycle through samples on /analyze |
| R | Re-run current analysis |
| F | Fullscreen the verdict card |
| ? | Open the shortcuts dialog |
| Esc | Close overlays |

You can also open directly with `?demo=1&presenter=1` on any page.

## Architecture

Two Gemini calls, one verdict.

1. **Stage 3 — Play understanding.** The server action uploads the clip to the Gemini Files API, waits for `ACTIVE`, then asks `gemini-2.5-flash` for a strictly neutral JSON observation: `play_description`, `key_events`, `players_involved`, `observable_contact`, `ambiguity_notes`, `candidate_rules`. Temperature 0.2. Zod validates.
2. **Stage 4 — Rule selection.** Deterministic. The server filters `BASKETBALL_RULES` by any tag that matches `candidate_rules`, caps at 6 entries.
3. **Stage 5 — Verdict synthesis.** A second Gemini call with the observation + selected rule excerpts. Returns `verdict`, `confidence_score`, `confidence_label`, `headline`, `reasoning`, `rule_citations`, `counterfactual`. Zod validates.
4. **Post-validation.** Every citation's `quote` is checked as a verbatim substring of the named rule's `text`. Unmatched citations are stripped. If the verdict is Fair/Bad but has zero valid citations, it is downgraded to Inconclusive with a templated reasoning. Low-observable-contact on a contact call triggers a confidence penalty.

See `docs/STUDY.md` for the full walkthrough, and `/about` for the architecture diagram.

## Project layout

```
app/
  page.tsx                 landing
  analyze/page.tsx         upload + sample library + history
  analyze/[id]/page.tsx    verdict page
  about/page.tsx           pipeline + limitations
  api/health/route.ts      Gemini health probe
  layout.tsx               root — fonts, presenter shell, grain
  globals.css              design tokens (@theme)
  icon.svg                 favicon

actions/
  describe-play.ts         Stage 2+3 server action
  synthesize-verdict.ts    Stage 4+5 server action

components/
  hero-cinematic.tsx       landing hero
  how-it-works-row.tsx     3-step row
  landing-verdict-teaser.tsx
  site-nav.tsx             top nav
  site-footer.tsx          footer w/ status dot
  system-status-dot.tsx    polls /api/health

  analyze-form.tsx         orchestrator on /analyze
  sport-picker.tsx         basketball pill (others disabled)
  sample-library.tsx       grid of SampleCard
  sample-card.tsx          poster + title + verdict tag
  video-dropzone.tsx       file upload w/ client-side validation
  video-trimmer.tsx        in-browser trim (ffmpeg.wasm) for clips >20s
  call-input.tsx           select + freetext

  analysis-theater.tsx     4-stage cinematic progress UI
  verdict-client.tsx       verdict page
  verdict-badge.tsx
  confidence-meter.tsx     animated bar + number ticker
  rule-citation-card.tsx
  reasoning-block.tsx
  counterfactual-note.tsx
  key-events-timeline.tsx  clickable markers seek the video
  history-list.tsx         session history on /analyze

  architecture-diagram.tsx SVG pipeline diagram on /about
  presenter-shell.tsx      global shortcut/HUD provider
  presenter-hud.tsx        bottom-right status pill
  shortcuts-dialog.tsx     Radix dialog

  ui/button.tsx
  ui/card.tsx

lib/
  types.ts                 domain types
  env.ts                   GEMINI_API_KEY loader + model const
  gemini.ts                SDK wrappers, uploadVideoToGemini, runStage3, runStage5
  prompts.ts               STAGE3_SYSTEM_PROMPT, STAGE5_SYSTEM_PROMPT, builders
  validate.ts              zod schemas + validateAndRepairVerdict + tryParseJson
  rules/basketball.ts      23 NBA rule entries + selectRulesForCandidates
  samples.ts               4 curated samples + pre-baked verdicts
  session.ts               sessionStorage helpers
  shortcuts.ts             useKeyboardShortcuts hook
  demo-mode.ts             useDemoMode hook
  utils.ts                 cn, uid, formatTimestamp, clamp

public/samples/            sample posters + drop MP4s here
  README.md                how to source real clips

docs/
  STUDY.md                 system walkthrough for the team
  QA-CHEATSHEET.md         10 likely judge questions + answers
  DEMO-SCRIPT.md           120-second beat-by-beat
  ROLES.md                 team split (A/B/C)
  PLAN.md                  condensed version of the build plan
```

## Adding real sample clips

The sample grid expects four files at:

```
public/samples/sample-a.mp4   The Driving Lane Collision
public/samples/sample-b.mp4   The Textbook Charge
public/samples/sample-c.mp4   The Rim Protector
public/samples/sample-d.mp4   The Gather Step
```

Each should be ≤ 20 seconds and small enough for the Gemini upload path (see server limits in `actions/describe-play.ts`). See `public/samples/README.md` for sourcing guidance. The app still works without them — the pre-baked verdicts in `lib/samples.ts` fire on sample selection, and the verdict page shows the poster image if the MP4 is missing.

## Limitations

- Single camera angle per clip. Many real calls require multi-angle review.
- Client accepts uploads up to 40 MB and can trim long clips in-browser; the analysis server action still enforces its own size cap for the Gemini file upload (see `actions/describe-play.ts`).
- Basketball only in v1. The rules module (`lib/rules/`) is designed so a second sport is a drop-in addition.
- NBA rulebook excerpts are paraphrased near-verbatim from the public [NBA Official Rulebook](https://official.nba.com/rulebook/). Post-validation guarantees we only cite text that appears in our shipped `RULES` array — but those excerpts themselves should be reviewed by a rules expert before production use.
- Gemini 2.5 Flash is the sole provider. A multi-provider fallback is a v2 concern.

## Tech

Next.js 15 App Router · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Radix UI · Zod · `@google/genai` (Gemini 2.5 Flash).

## License

MIT. See [LICENSE](./LICENSE).
