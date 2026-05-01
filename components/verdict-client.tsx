"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { getAnalysis, updateAnalysisGroundTruth } from "@/lib/session";
import type { FullAnalysis } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileJson, Loader2, RotateCcw } from "lucide-react";
import { VerdictBadge, getVerdictPalette } from "@/components/verdict-badge";
import { ConfidenceMeter } from "@/components/confidence-meter";
import { RuleCitationCard } from "@/components/rule-citation-card";
import { ReasoningBlock } from "@/components/reasoning-block";
import { CounterfactualNote } from "@/components/counterfactual-note";
import { CounterargumentNote } from "@/components/counterargument-note";
import { VerdictExportButton } from "@/components/verdict-export-button";
import { VideoPlayer } from "@/components/video-player";
import {
  JumpToContactPill,
  pickContactEvent,
} from "@/components/jump-to-contact-pill";
import { VerdictTransparency } from "@/components/verdict-transparency";
import { GroundTruthNote } from "@/components/ground-truth-note";
import { useKeyboardShortcuts } from "@/lib/shortcuts";
import { snapToFrame } from "@/lib/utils";
import { TIMESTAMP_OFFSET_SECONDS } from "@/lib/env";
import { selectRulesForCandidates } from "@/lib/rules/basketball";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

function samplePosterFor(a: FullAnalysis): string | undefined {
  if (!a.is_sample) return undefined;
  const match = a.video_url.match(/\/samples\/(sample-[a-d])\.mp4$/);
  if (!match) return undefined;
  return `/samples/${match[1]}.svg`;
}

function clipDownloadFilename(a: FullAnalysis): string {
  if (a.is_sample) {
    const last = a.video_url.split("/").pop()?.split("?")[0];
    if (last && /\.(mp4|webm|mov)$/i.test(last)) return last;
    return "sample-clip.mp4";
  }
  return `refcheck-clip-${a.id.slice(0, 8)}.mp4`;
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
  const [downloadBusy, setDownloadBusy] = React.useState(false);

  React.useEffect(() => {
    const found = getAnalysis(analysisId);
    if (found) {
      setAnalysis(found);
      setStatus("found");
    } else {
      setStatus("missing");
    }
  }, [analysisId]);

  const handleSaveGroundTruth = React.useCallback(
    (note: string) => {
      updateAnalysisGroundTruth(analysisId, note);
      setAnalysis((prev) =>
        prev
          ? { ...prev, ground_truth_note: note.trim() || undefined }
          : prev
      );
    },
    [analysisId]
  );

  const handleExportJson = React.useCallback(() => {
    if (!analysis) return;
    // Event-editor UI is hidden on the verdict page for now, so the user
    // cannot modify key_events from here. Export still ships every other
    // field and the ground truth note.
    const corrections_applied = false;

    const payload = {
      id: analysis.id,
      video_url: analysis.video_url,
      original_call: analysis.original_call,
      understanding: analysis.understanding,
      verdict: analysis.verdict,
      ground_truth_note: analysis.ground_truth_note ?? null,
      corrections_applied,
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `refcheck-correction-${analysis.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [analysis]);

  const handleDownloadClip = React.useCallback(async () => {
    if (!analysis?.video_url) return;
    const src = analysis.video_url;
    const filename = clipDownloadFilename(analysis);

    if (src.startsWith("blob:")) {
      const a = document.createElement("a");
      a.href = src;
      a.download = filename;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const absolute =
      src.startsWith("http://") || src.startsWith("https://")
        ? src
        : `${window.location.origin}${src.startsWith("/") ? src : `/${src}`}`;

    setDownloadBusy(true);
    try {
      const res = await fetch(absolute);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(absolute, "_blank", "noopener,noreferrer");
    } finally {
      setDownloadBusy(false);
    }
  }, [analysis]);

  const jumpToContact = React.useCallback(() => {
    const events = analysis?.understanding.key_events;
    if (!events) return;
    const target = pickContactEvent(events);
    const video = videoRef.current;
    if (!target || !video) return;
    const t = snapToFrame(
      Math.max(0, target.t_seconds + TIMESTAMP_OFFSET_SECONDS)
    );
    video.pause();
    video.currentTime = t;
    video.playbackRate = 0.5;
    void video.play().catch(() => {
      /* ignore autoplay rejection */
    });
  }, [analysis]);

  // After the clip plays through once, auto-rewind to ~1s before the key
  // moment and loop at 0.5x. Judges asking "can you show that again?" get
  // a slow-mo replay for free without anyone touching the mouse.
  React.useEffect(() => {
    const video = videoRef.current;
    const events = analysis?.understanding.key_events;
    if (!video || !events || events.length === 0) return;

    const onEnded = () => {
      const target = pickContactEvent(events);
      if (!target) return;
      const contactT = snapToFrame(
        Math.max(0, target.t_seconds + TIMESTAMP_OFFSET_SECONDS)
      );
      const startT = Math.max(0, contactT - 1);
      video.currentTime = startT;
      video.playbackRate = 0.5;
      void video.play().catch(() => {
        /* ignore autoplay rejection */
      });
    };

    video.addEventListener("ended", onEnded);
    return () => video.removeEventListener("ended", onEnded);
  }, [analysis]);

  const togglePlayPause = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => {
        /* ignore */
      });
    } else {
      video.pause();
    }
  }, []);

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
        j: jumpToContact,
        k: togglePlayPause,
      }),
      [router, jumpToContact, togglePlayPause]
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
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to analyze
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => void handleDownloadClip()}
            disabled={!analysis.video_url || downloadBusy}
            aria-label="Download video clip"
          >
            {downloadBusy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            Download clip
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleExportJson}
            aria-label="Export correction JSON"
          >
            <FileJson className="size-3.5" />
            Export JSON
          </Button>
          <VerdictExportButton analysis={analysis} />
          <Button asChild size="sm" variant="secondary">
            <Link href="/analyze">
              <RotateCcw className="size-3.5" />
              Analyze another
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        {/* Left column: video + key events — sticky so it stays visible while scrolling the verdict */}
        <motion.div
          initial={{ opacity: 0, x: reduced ? 0 : -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-4 lg:sticky lg:top-24 lg:z-[1] lg:self-start"
        >
          <VideoPlayer
            videoRef={videoRef}
            src={analysis.video_url}
            poster={samplePosterFor(analysis)}
          />

          <JumpToContactPill
            events={analysis.understanding.key_events}
            videoRef={videoRef}
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

          <GroundTruthNote
            initialNote={analysis.ground_truth_note ?? ""}
            onSave={handleSaveGroundTruth}
          />

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

          {analysis.verdict.counterargument && (
            <CounterargumentNote text={analysis.verdict.counterargument} />
          )}

          <VerdictTransparency
            understanding={analysis.understanding}
            selectedRules={selectRulesForCandidates(
              analysis.understanding.candidate_rules
            )}
          />
        </div>
      </div>
    </div>
  );
}
