"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { getAnalysis } from "@/lib/session";
import type { FullAnalysis } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import { VerdictBadge, getVerdictPalette } from "@/components/verdict-badge";
import { ConfidenceMeter } from "@/components/confidence-meter";
import { RuleCitationCard } from "@/components/rule-citation-card";
import { ReasoningBlock } from "@/components/reasoning-block";
import { CounterfactualNote } from "@/components/counterfactual-note";
import { KeyEventsTimeline } from "@/components/key-events-timeline";
import { useKeyboardShortcuts } from "@/lib/shortcuts";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

function samplePosterFor(a: FullAnalysis): string | undefined {
  if (!a.is_sample) return undefined;
  const match = a.video_url.match(/\/samples\/(sample-[a-d])\.mp4$/);
  if (!match) return undefined;
  return `/samples/${match[1]}.svg`;
}

export function VerdictClient({ analysisId }: { analysisId: string }) {
  const reduced = useReducedMotion();
  const router = useRouter();
  const [analysis, setAnalysis] = React.useState<FullAnalysis | null>(null);
  const [status, setStatus] = React.useState<"loading" | "found" | "missing">(
    "loading"
  );
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const [duration, setDuration] = React.useState<number | null>(null);

  React.useEffect(() => {
    const found = getAnalysis(analysisId);
    if (found) {
      setAnalysis(found);
      setStatus("found");
    } else {
      setStatus("missing");
    }
  }, [analysisId]);

  useKeyboardShortcuts(
    React.useMemo(
      () => ({
        r: () => router.push("/analyze"),
        f: () => {
          const el = cardRef.current;
          if (!el) return;
          if (document.fullscreenElement) {
            void document.exitFullscreen();
          } else {
            void el.requestFullscreen?.().catch(() => {
              /* ignore */
            });
          }
        },
      }),
      [router]
    )
  );

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-24 text-muted">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Loading analysis…
      </div>
    );
  }

  if (status === "missing" || !analysis) {
    return (
      <div className="mx-auto max-w-md rounded-[var(--radius-card)] border border-border-subtle bg-surface p-8 text-center shadow-[var(--shadow-card)]">
        <h1 className="font-display text-3xl">Analysis not found</h1>
        <p className="mt-2 text-sm text-muted">
          We couldn&apos;t find that analysis in your session. Analyses are
          stored per tab — start a new one to continue.
        </p>
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link href="/analyze">
              <ArrowLeft className="size-4" /> Start a new analysis
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const palette = getVerdictPalette(analysis.verdict.verdict);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to analyze
        </Link>
        <Button asChild size="sm" variant="secondary">
          <Link href="/analyze">
            <RotateCcw className="size-3.5" />
            Analyze another
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Left column: video + key events */}
        <motion.div
          initial={{ opacity: 0, x: reduced ? 0 : -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-4"
        >
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-background shadow-[var(--shadow-card)]">
            <video
              ref={videoRef}
              src={analysis.video_url}
              poster={samplePosterFor(analysis)}
              className="aspect-video w-full bg-background"
              controls
              muted
              playsInline
              onLoadedMetadata={(e) => {
                const d = (e.target as HTMLVideoElement).duration;
                if (Number.isFinite(d)) setDuration(d);
              }}
            />
          </div>

          <KeyEventsTimeline
            events={analysis.understanding.key_events}
            videoRef={videoRef}
            duration={duration}
          />

          <div className="rounded-[var(--radius-card)] border border-border-subtle bg-surface p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              What the AI saw
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {analysis.understanding.play_description}
            </p>
            {analysis.understanding.ambiguity_notes &&
              analysis.understanding.ambiguity_notes !==
                "No significant ambiguity." && (
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-verdict-inconclusive">
                  Ambiguity · {analysis.understanding.ambiguity_notes}
                </p>
              )}
          </div>
        </motion.div>

        {/* Right column: verdict */}
        <div className="flex flex-col gap-5">
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: reduced ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative overflow-hidden rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-card)]",
              palette.border,
              palette.bg
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full"
              style={{
                background: `radial-gradient(closest-side, ${
                  analysis.verdict.verdict === "FAIR_CALL"
                    ? "rgba(16,185,129,0.25)"
                    : analysis.verdict.verdict === "BAD_CALL"
                      ? "rgba(239,68,68,0.25)"
                      : "rgba(245,158,11,0.25)"
                }, transparent)`,
              }}
            />

            <VerdictBadge verdict={analysis.verdict.verdict} />

            <motion.h1
              initial={{ opacity: 0, y: reduced ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25, ease: "easeOut" }}
              className="mt-5 font-display text-3xl leading-tight md:text-4xl"
            >
              {analysis.verdict.headline}
            </motion.h1>

            <div className="mt-6">
              <ConfidenceMeter
                score={analysis.verdict.confidence_score}
                label={analysis.verdict.confidence_label}
                barClassName={palette.bar}
                delay={0.4}
              />
            </div>
          </motion.div>

          <ReasoningBlock reasoning={analysis.verdict.reasoning} />

          {analysis.verdict.rule_citations.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                Rule citations
              </p>
              {analysis.verdict.rule_citations.map((c, i) => (
                <RuleCitationCard key={i} citation={c} index={i} />
              ))}
            </div>
          )}

          {analysis.verdict.counterfactual && (
            <CounterfactualNote text={analysis.verdict.counterfactual} />
          )}
        </div>
      </div>
    </div>
  );
}
