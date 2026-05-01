# STUDY.md — How RefCheck AI actually works

Read this the morning of the demo. It is written so you can explain every part of the product without looking at the code. Section 8 cross-references the Q&A cheat sheet.

## 1. The product in five sentences

RefCheck AI lets someone ask, _"Was that a fair call?"_ about a short basketball clip. The user uploads a 20-second video (or picks one of our four curated samples), optionally tells us what the referee called on the floor, and the app runs the clip through Google Gemini 2.5 Pro. The model returns a neutral observation of the play — who did what, when contact happened, what rules might apply — and then a second Gemini call compares that observation against verbatim excerpts from the NBA rulebook we shipped with the app. The user sees a verdict card that says Fair, Bad, or Inconclusive, with a confidence score and cited rule quotes. Every quote is server-validated as a substring match against the real rule text; if it isn't, it gets stripped.

## 2. The Next.js App Router in 60 seconds

Next.js 15 App Router means each folder under `app/` is a route. `app/page.tsx` is the homepage. `app/analyze/page.tsx` is `/analyze`. `app/analyze/[id]/page.tsx` is `/analyze/<anything>` — the `[id]` is dynamic.

Pages are React Server Components by default — they render on the server and ship HTML + a small hydration script. A file that needs browser APIs (state, effects, event handlers) starts with `"use client"`. We use server components for shells and client components for anything interactive (the dropzone, the theater, the verdict card).

`app/layout.tsx` is the shared shell: it loads fonts, mounts the `PresenterShell` (which listens to keyboard shortcuts globally), and wraps every page.

## 3. Server actions vs API routes

We use **server actions** for the analysis pipeline — `actions/describe-play.ts` and `actions/synthesize-verdict.ts`. A server action is a function marked `"use server"` that the client can call directly as if it were local, but it runs on the server. Next.js handles the fetch/serialization automatically.

We use a traditional **API route** for one thing: `app/api/health/route.ts`, which returns JSON at `GET /api/health`. That's used by the green status dot in the footer, which polls every 60 seconds.

Server actions win for the pipeline because:
- They can accept `FormData` directly (ideal for file uploads).
- They are per-request and co-located with the component that calls them.
- The return value is a typed object, not hand-rolled JSON.

## 4. The Gemini video call — end to end

Everything lives in `lib/gemini.ts`.

```
Client                   Server (Node)              Gemini
------                   ------------              ------
pick clip or sample →
click Analyze →
  (runUploadPipeline)    describePlayAction(fd)
                         └─ uploadVideoToGemini     → Files API upload
                                                    ← file state ACTIVE
                         └─ runStage3(file, call)   → gemini-2.5-pro
                                                      systemInstruction = STAGE3_SYSTEM_PROMPT
                                                      responseMimeType = application/json
                                                    ← observation JSON
                         └─ zod validate
                         ← understanding returned to client
  (theater flips to
   consulting_rulebook)
                         synthesizeVerdictAction({u, call})
                         └─ selectRulesForCandidates(u.candidate_rules)
                         └─ runStage5(u, call, rules) → gemini-2.5-pro
                                                      systemInstruction = STAGE5_SYSTEM_PROMPT
                                                    ← verdict JSON
                         └─ zod validate
                         └─ validateAndRepairVerdict
                              • strip citations whose quote isn't verbatim
                              • if zero valid, force INCONCLUSIVE
                              • if contact=none + contact call, penalty
                         ← verdict returned to client
  (theater flips to
   rendering_verdict)
  saveAnalysis → sessionStorage
  router.push(/analyze/<id>)
```

Why two calls instead of one? Because giving the model the rules up front biases it. The Stage 3 call is deliberately blind to the rulebook — it only observes. Stage 5 sees rules but not the raw video; it reasons over the structured observation plus the verbatim excerpts. This separation is what lets us enforce citation integrity.

## 5. Where the rules live and how they reach the model

`lib/rules/basketball.ts` exports a single constant `BASKETBALL_RULES`. Each entry has:

- `id` — stable identifier (`blocking_defender_position`, `verticality`, etc.).
- `tags` — controlled vocabulary matching `candidate_rules` in Stage 3.
- `section`, `title`, `text`, `source_url` — displayed verbatim.

`selectRulesForCandidates(tags)` filters by tag overlap, deduplicates, caps at 6. That filtered list is what Stage 5 sees. If the model cites a rule we didn't give it, the citation is stripped in `validateAndRepairVerdict`.

To add more rules: append entries to `BASKETBALL_RULES`. To support another sport: make `lib/rules/<sport>.ts`, add a sport tag to the dispatch layer, and extend the Stage 3 `candidate_rules` vocabulary.

## 6. The failsafe layer

We assume Gemini will occasionally time out, rate-limit, or return malformed JSON. Three safeguards:

1. **Timeouts.** `STAGE3_TIMEOUT_MS = 20s`, `STAGE5_TIMEOUT_MS = 15s`, file upload poll caps at 15s. These live in `lib/gemini.ts`.
2. **JSON repair.** `tryParseJson` in `lib/validate.ts` handles `\`\`\`json` fences or surrounding prose the model might slip in.
3. **Graceful errors.** Server actions never throw; they return `{ ok: false, error, message, retryable }`. The `AnalysisTheater` picks these up and shows a calm error state with a Retry button.
4. **Sample failsafe.** Sample plays don't even hit Gemini. `runSamplePipeline` paces through the theater with pre-baked verdicts from `lib/samples.ts`. That means the demo works on airplane mode, on a bad hotel Wi-Fi, or if Gemini is having an outage.

## 7. What to check before walking on stage

- `npm run dev` up.
- `.env.local` has `GEMINI_API_KEY` (needed only for user-upload path; samples work without it).
- Footer status dot is green.
- Open `/analyze?demo=1&presenter=1`.
- Pre-load each sample once so the video poster + any real MP4 is cached.

## 8. Judge Q&A cross-reference

See `QA-CHEATSHEET.md` for canned answers to the ten questions you're most likely to get asked. Study the **Why Gemini**, **Why no vector DB**, and **How do you prevent hallucinated rules** answers first — those are the three that almost always come up.
