# Sample Plays — source files

The app expects four short basketball clips here:

- `sample-a.mp4` — The Driving Lane Collision (blocking foul, fair call)
- `sample-b.mp4` — The Textbook Charge (blocking called; should have been charge — bad call)
- `sample-c.mp4` — The Rim Protector (goaltending — inconclusive)
- `sample-d.mp4` — The Gather Step (travel called; legal gather — bad call)

## Constraints

Each clip should be:

- `.mp4` (H.264 or H.265) — safest for browser playback and Gemini ingest
- ≤ 20 seconds
- ≤ 10 MB
- 480p or 720p (keeps upload + Gemini cost low)

## Sourcing tips

Prefer clips without copyright friction:

- NCAA highlight reels
- FIBA / Olympic footage
- Public-domain or Creative Commons basketball footage
- Self-recorded practice clips

If an NBA clip is a perfect fit for a demo beat, keep it under 10 seconds and credit the source in `docs/DEMO-SCRIPT.md`.

## What happens if the MP4s are missing

The app will still run. Pre-baked verdicts in `lib/samples.ts` fire via the demo-mode failsafe, the verdict page renders, and the only visible effect is an empty `<video>` element on the verdict page. Drop real MP4 files here whenever you're ready.

Poster images (`sample-a.svg`, `sample-b.svg`, etc.) are stylized placeholders and will be replaced by real MP4 thumbnails once the clips are added.
