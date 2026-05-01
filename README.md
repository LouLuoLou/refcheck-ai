# RefCheck AI

AI-assisted basketball officiating review. Upload a short clip, and the app uses **Google Gemini** (multimodal video) plus **NBA rulebook excerpts** to return a cited verdict: **Fair call**, **Bad call**, or **Inconclusive**, with confidence and reasoning.

## Features

- Video upload (MP4 / MOV / WEBM), optional in-browser trim for longer clips (see `lib/env.ts` for max analysis duration).
- Optional **original call** (blocking foul, charge, traveling, etc.) plus free-text context.
- Neutral **play observation** (JSON), deterministic **rule selection**, then **verdict synthesis** with **verbatim rule citations** (invalid quotes are stripped; weak coverage can downgrade to Inconclusive).
- Session history for recent analyses (browser `sessionStorage`).
- **About** page with pipeline overview and limitations.

## Quick start

```bash
npm install
cp .env.local.example .env.local
# Set GEMINI_API_KEY in .env.local

npm run dev
# http://localhost:3000
```

Get an API key from [Google AI Studio](https://aistudio.google.com/apikey).

## Deploy

Use any Next.js-friendly host (e.g. [Vercel](https://vercel.com)). Set **`GEMINI_API_KEY`** (or `GOOGLE_API_KEY`) in the project environment. Build command: `npm run build`.

## How it works

1. **Observation** — Clip is uploaded to the Gemini Files API; the model returns structured fields: description, key events, contact level, ambiguity notes, candidate rule tags.
2. **Rules** — `lib/rules/basketball.ts` entries matching those tags are selected (capped).
3. **Verdict** — A second model pass compares the observation to those excerpts and returns Fair / Bad / Inconclusive, citations, and supporting copy.
4. **Validation** — Citations must match rule text exactly; see `lib/validate.ts`.

More detail: `docs/STUDY.md` and the in-app **About** page.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Framer Motion · Radix UI · Zod · `@google/genai`

## Limitations

- Single-camera clips; occlusion and angle limits real accuracy.
- **Basketball only** in this codebase; additional sports would follow the same pattern under `lib/rules/`.
- Rule text is curated from the public [NBA rulebook](https://official.nba.com/rulebook/); not a substitute for official league review.

## License

MIT. See [LICENSE](./LICENSE).
