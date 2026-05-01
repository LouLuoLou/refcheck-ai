import { NextResponse } from "next/server";
import { GEMINI_MODEL, getGeminiApiKey } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        model: GEMINI_MODEL,
        reason: "missing_api_key",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: "Reply with the single word: ok",
      config: {
        abortSignal: controller.signal,
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 8,
      },
    });

    clearTimeout(timer);
    const text = response.text?.trim().toLowerCase() ?? "";

    return NextResponse.json({
      ok: text.includes("ok"),
      model: GEMINI_MODEL,
      reply_preview: text.slice(0, 40),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      model: GEMINI_MODEL,
      reason: err instanceof Error ? err.message : "unknown",
      timestamp: new Date().toISOString(),
    });
  }
}
