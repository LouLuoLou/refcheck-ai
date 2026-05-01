/**
 * Generates RefCheck-AI.pptx — run: npm install && npm run build
 */
import pptxgen from "pptxgenjs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const C = {
  bg: "0A0A0B",
  surface: "121214",
  text: "F5F5F4",
  muted: "A8A29E",
  accent: "F5C518",
  fair: "10B981",
  bad: "EF4444",
  inconclusive: "F59E0B",
};

const pptx = new pptxgen();
pptx.author = "RefCheck AI";
pptx.title = "RefCheck AI";
pptx.subject = "Basketball officiating review";
pptx.company = "RefCheck AI";

function accentBar(slide) {
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: 10,
    h: 0.12,
    fill: { color: C.accent },
    line: { width: 0 },
  });
}

function slideTitle(slide, title, y = 0.35) {
  slide.addText(title, {
    x: 0.5,
    y,
    w: 9,
    h: 0.55,
    fontSize: 28,
    bold: true,
    color: C.text,
    fontFace: "Arial",
  });
  slide.addShape("rect", {
    x: 0.5,
    y: y + 0.52,
    w: 1.2,
    h: 0.04,
    fill: { color: C.accent },
    line: { width: 0 },
  });
}

function body(slide, lines, startY = 1.05, size = 14) {
  slide.addText(lines.join("\n"), {
    x: 0.55,
    y: startY,
    w: 9,
    h: 4.5,
    fontSize: size,
    color: C.muted,
    fontFace: "Arial",
    valign: "top",
    lineSpacingMultiple: 1.25,
  });
}

function placeholder(slide, label, x, y, w, h) {
  slide.addShape("rect", {
    x,
    y,
    w,
    h,
    fill: { color: C.surface },
    line: { color: C.accent, width: 1, dashType: "sysDash" },
  });
  slide.addText(label, {
    x,
    y: y + h / 2 - 0.35,
    w,
    h: 0.8,
    fontSize: 13,
    color: C.muted,
    align: "center",
    fontFace: "Arial",
    italic: true,
  });
}

// --- Slide 1: Title ---
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  accentBar(slide);
  slide.addText("RefCheck AI", {
    x: 0.5,
    y: 1.65,
    w: 9,
    h: 1,
    fontSize: 44,
    bold: true,
    color: C.text,
    fontFace: "Arial",
  });
  slide.addText("Basketball officiating review backed by the NBA rulebook", {
    x: 0.5,
    y: 2.55,
    w: 9,
    h: 0.5,
    fontSize: 18,
    color: C.accent,
    fontFace: "Arial",
  });
  slide.addText("Multimodal AI (Gemini) → structured play understanding → cited Fair / Bad / Inconclusive verdicts", {
    x: 0.5,
    y: 3.2,
    w: 8.5,
    h: 0.8,
    fontSize: 14,
    color: C.muted,
    fontFace: "Arial",
  });
  slide.addText("Team", {
    x: 0.5,
    y: 4.15,
    w: 2,
    h: 0.35,
    fontSize: 11,
    color: C.accent,
    bold: true,
    fontFace: "Arial",
  });
  slide.addText("Ruben Ronquillo  •  Cristobal Talamentes  •  Juan Reyes", {
    x: 0.5,
    y: 4.45,
    w: 9,
    h: 0.45,
    fontSize: 15,
    color: C.text,
    fontFace: "Arial",
  });
}

// --- Slide 2: Problem ---
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  accentBar(slide);
  slideTitle(slide, "What problem does RefCheck solve?");
  body(slide, [
    "Fans, players, and coaches argue about referee calls every week — usually without an objective, rule-grounded second opinion.",
    "",
    "• Clip goes viral / emotions run hot — but there's no quick link from \"what we think we saw\" to the actual rule text.",
    "• Single-camera phone video misses angles pros use in replay centers.",
    "",
    "RefCheck doesn't replace the league — it helps everyday viewers compare what happened on the tape they have to the wording of official rules, with transparent reasoning.",
  ]);
}

// --- Slide 3: Solution ---
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  accentBar(slide);
  slideTitle(slide, "What RefCheck does");
  body(slide, [
    "A web app where you:",
    "",
    "1. Select basketball and upload a short clip (with optional in-browser trim).",
    "2. Optionally record the call the ref made (blocking foul, charge, travel, etc.).",
    "3. The system watches the video with Gemini, picks relevant NBA rule snippets, and returns:",
    "",
    "   • Fair call  ·  Bad call  ·  Inconclusive",
    "   • Confidence, headline, reasoning, verbatim rule citations, and counter-arguments for transparency.",
  ], 0.95, 15);
}

// --- Slide 4: Tech stack ---
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  accentBar(slide);
  slideTitle(slide, "Technologies");
  body(slide, [
    "Frontend & app",
    "  Next.js (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Radix UI",
    "",
    "AI & validation",
    "  Google Gemini (multimodal video via Files API) · @google/genai",
    "  Zod schemas + post-validation (citations must be verbatim substrings of shipped rule text)",
    "",
    "Client utilities",
    "  ffmpeg.wasm — trim long clips in the browser before upload",
    "",
    "Rules data",
    "  Curated NBA rule excerpts in TypeScript (`lib/rules/basketball.ts`) — designed so another sport can be added alongside.",
  ], 0.95, 13.5);
}

// --- Slide 5: How it works (pipeline) ---
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  accentBar(slide);
  slideTitle(slide, "How it works");
  body(slide, [
    "Stage 1 — Observation (Gemini on video)",
    "   Neutral JSON: play description, timestamped key events, observable contact, ambiguity notes, candidate rule tags.",
    "",
    "Stage 2 — Rule retrieval (deterministic)",
    "   Match tags → pull up to six rule excerpts from the in-repo NBA rulebook.",
    "",
    "Stage 3 — Verdict (Gemini on text + rules)",
    "   Fair / Bad / Inconclusive + confidence + headline + reasoning + citations + counterfactual.",
    "",
    "Guardrails",
    "   Invalid citations stripped; zero remaining citations can force Inconclusive. Extra heuristics for travel / occlusion and contact-foul cases.",
  ], 0.95, 12.5);
}

// --- Slide 6: Layout + placeholder screenshot ---
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  accentBar(slide);
  slideTitle(slide, "Product layout");
  body(
    slide,
    [
      "• Landing — value prop and flow overview",
      "• /analyze — sport picker, upload + trimmer, call input, session history",
      "• /analyze/[id] — video player, key-event timeline, verdict card, rule citations, export",
      "• /about — pipeline and limitations",
      "",
      "Screenshot placeholder →",
    ],
    0.95,
    12
  );
  placeholder(
    slide,
    "📷  Replace with screenshot:\nAnalyze or verdict page",
    5.35,
    1.85,
    4.35,
    3.45
  );
}

// --- Slide 7: Architecture placeholder ---
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  accentBar(slide);
  slideTitle(slide, "Architecture (diagram)");
  slide.addText("Paste your pipeline / system diagram here — or use the SVG from the About page.", {
    x: 0.55,
    y: 0.95,
    w: 9,
    h: 0.45,
    fontSize: 13,
    color: C.muted,
    fontFace: "Arial",
    italic: true,
  });
  placeholder(slide, "📷  Diagram / architecture slide image", 0.55, 1.45, 9, 3.85);
}

// --- Slide 8: Limitations ---
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  accentBar(slide);
  slideTitle(slide, "Limitations (today)");
  body(slide, [
    "• Single angle — many NBA replay decisions use multiple cameras.",
    "• Video sampling & model limits — fast footwork or referee occlusion can be misread or over-confident.",
    "• Basketball v1 only — other sports need their own rule modules.",
    "• Curated rule excerpts — not the full rulebook; quotes are validated against what we ship, not against live NBA PDFs.",
    "",
    "Inconclusive is a feature when evidence isn't there — not a bug.",
  ]);
}

// --- Slide 9: Phase 2 ---
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  accentBar(slide);
  slideTitle(slide, "Phase 2 — labels, ground truth & training data");
  body(slide, [
    "Today: prompts + heuristics + general-purpose Gemini — strong prototype, not a calibrated officiating model.",
    "",
    "Next steps with real data:",
    "  • Collect clips with expert labels: fair / bad / inconclusive + occlusion tags + call type.",
    "  • Use exported user notes (ground-truth field) and judge agreement as weak supervision.",
    "  • Benchmark: when humans say \"can't tell,\" the model should trend Inconclusive / low confidence.",
    "  • Optional fine-tuning or distillation on observation + verdict JSON; or specialized footwork / pose models.",
    "",
    "That closes the gap between \"demo\" and production-grade sports officiating AI.",
  ], 0.95, 12.5);
}

// --- Slide 10: Closing ---
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  accentBar(slide);
  slide.addText("Thank you", {
    x: 0.5,
    y: 1.9,
    w: 9,
    h: 0.7,
    fontSize: 36,
    bold: true,
    color: C.text,
    fontFace: "Arial",
  });
  slide.addText("RefCheck AI — Ruben Ronquillo · Cristobal Talamentes · Juan Reyes", {
    x: 0.5,
    y: 2.75,
    w: 9,
    h: 0.45,
    fontSize: 14,
    color: C.muted,
    fontFace: "Arial",
  });
  placeholder(slide, "📷  QR code or live demo URL", 3.25, 3.35, 3.5, 1.85);
  slide.addText("Add: GitHub repo URL · deployed app URL", {
    x: 0.5,
    y: 5.35,
    w: 9,
    h: 0.4,
    fontSize: 12,
    color: C.accent,
    align: "center",
    fontFace: "Arial",
  });
}

const outPath = join(__dirname, "RefCheck-AI-Deck.pptx");
await pptx.writeFile({ fileName: outPath });
console.log("Wrote:", outPath);
