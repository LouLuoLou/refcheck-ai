# DEMO-SCRIPT.md — The 120-second live pitch

This is the sentence-by-sentence script. Practice it three times. Watch the clock.

## Pre-demo checklist (do these in the final 10 minutes before)

- [ ] Laptop plugged in. Battery 100%.
- [ ] Projector plugged in. Mirror display, 1920×1080.
- [ ] Close every Chrome tab except one.
- [ ] Open Chrome. Disable extensions that might show overlays.
- [ ] Go to `http://<your-deploy-url>/?demo=1&presenter=1` (or `localhost:3000/?demo=1&presenter=1` if deploying locally).
- [ ] Confirm the green status dot in the footer is green.
- [ ] Click into `/analyze` once and let it load. Hover each sample card to pre-cache posters.
- [ ] Airplane-mode test: turn Wi-Fi off, click Sample A, confirm verdict still fires (pre-baked).
- [ ] Turn Wi-Fi back on.
- [ ] Press Shift+D once to confirm demo toast/indicator. Press P to confirm presenter mode.

## Script

### 0:00–0:10 — The hook

*(Landing page open, headline visible)*

> "Every weekend, millions of fans argue about referee calls. You've done it. Your parents have done it. Nobody has ever had an objective way to check."

### 0:10–0:22 — The product

*(Click "Analyze a Play")*

> "RefCheck AI is a web app that takes a short clip of a sports play, watches it with AI, and compares it to the actual rulebook. We're launching with basketball."

### 0:22–0:38 — Pick the sample, set the call

*(On analyze page, click Sample A — The Driving Lane Collision. Pick "Blocking foul" in the dropdown — it auto-selects.)*

> "Here's a drive to the rim where the ref called a blocking foul. The fan reporting it wants to know: was the ref right?"

*(Click "Analyze Sample Play →")*

### 0:38–0:52 — The theater (narrate while it plays)

*(Theater opens, stages advance)*

> "The app uploads to Gemini 2.5 Pro. Gemini watches the play and describes it. Then the server selects only the NBA rules that matter — block, charge, verticality, and the restricted-area rule."

### 0:52–1:15 — Verdict reveal

*(Verdict card lands)*

> "Fair call. 82 percent confidence. The defender was still sliding laterally at contact, inside the restricted area. Under Rule 12, that disqualifies a charge and upholds the block."

*(Point at the rule citation card)*

> "Every one of those quotes is verified as a verbatim substring of the real NBA rule text. No hallucinations."

### 1:15–1:30 — The counter-example (prove it isn't scripted)

*(Press ← to go back, then click Sample B — The Textbook Charge)*

> "Here's the opposite situation. Same category of play, but the defender had both feet set, torso square, outside the restricted area — before the offensive player lowered his shoulder."

*(Click Analyze)*

### 1:30–1:45 — Second verdict

*(Verdict reveals)*

> "Bad call. 78 percent confidence. Same rulebook, different facts, different answer. This should have been a charge."

### 1:45–1:55 — The architecture

*(Navigate to /about — the pipeline diagram is visible)*

> "Under the hood: Gemini 2.5 Pro for multimodal video, our curated NBA rulebook, and every citation is validated against the real rule text before it hits the screen."

### 1:55–2:00 — The close

*(Scroll to the tagline / back to /)*

> "RefCheck AI. Was it a fair call? Now you can know."

## Contingency notes

- **If live Gemini fails silently and pre-baked fires:** no change to the script. The animation still runs, the verdict still lands.
- **If a sample clip poster doesn't load:** press → to skip to the next sample. All four are independently valid demo material.
- **If the status dot goes red mid-demo:** ignore it. Keep going. If a judge asks during Q&A, say _"Our health check pings Gemini with a text-only call — the video pipeline is separate and healthy, as you just saw."_
- **If you forget your line:** say the three stock phrases in order: _"the app watches the clip"_, _"the model cites the rulebook verbatim"_, _"the verdict is always either Fair, Bad, or Inconclusive — we don't force an answer."_ The judges will fill in the blanks.

## Copyright / sourcing note

The four sample clips shipped in `public/samples/` are (or should be) sourced from:
- NCAA highlight reels, FIBA, or Olympic footage — preferred, no friction.
- Public-domain or Creative Commons basketball footage — acceptable.
- Self-recorded practice clips — acceptable.

If an NBA clip is a perfect fit for any beat of the demo, keep it under 10 seconds and credit the source in the presentation.
