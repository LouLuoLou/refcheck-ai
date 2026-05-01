"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SportPicker } from "@/components/sport-picker";
import { VideoDropzone, type DropzoneState } from "@/components/video-dropzone";
import { VideoTrimmer } from "@/components/video-trimmer";
import { CallInput } from "@/components/call-input";
import { Button } from "@/components/ui/button";
import {
  AnalysisTheater,
  type TheaterStage,
} from "@/components/analysis-theater";
import { saveAnalysis } from "@/lib/session";
import type { BasketballCall, FullAnalysis } from "@/lib/types";
import { analyzeClipAction } from "@/actions/analyze-clip";
import { useKeyboardShortcuts } from "@/lib/shortcuts";
import { MAX_ANALYSIS_CLIP_SECONDS } from "@/lib/env";

type TheaterState = {
  open: boolean;
  stage: TheaterStage;
  detail: string | null;
  errorMessage: string | null;
  retryable: boolean;
};

const initialTheater: TheaterState = {
  open: false,
  stage: "uploading",
  detail: null,
  errorMessage: null,
  retryable: false,
};

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function prettifyTags(tags: readonly string[]): string {
  if (tags.length === 0) return "Matching rulebook sections…";
  const words = tags.slice(0, 3).map((t) => t.replace(/_/g, " "));
  return `Reviewing ${words.join(", ")}`;
}

export function AnalyzeForm() {
  const router = useRouter();
  const reduced = useReducedMotion();

  const [dropzone, setDropzone] = React.useState<DropzoneState>({
    file: null,
    durationSeconds: null,
    objectUrl: null,
    error: null,
  });
  const [call, setCall] = React.useState<BasketballCall | null>(null);
  const [freetext, setFreetext] = React.useState("");
  const [theater, setTheater] = React.useState<TheaterState>(initialTheater);
  const [submitting, setSubmitting] = React.useState(false);

  const replaceDropzone = React.useCallback((next: DropzoneState) => {
    setDropzone((prev) => {
      if (prev.objectUrl && prev.objectUrl !== next.objectUrl) {
        URL.revokeObjectURL(prev.objectUrl);
      }
      return next;
    });
  }, []);

  const canSubmit = Boolean(dropzone.file);

  const onDropzoneChange = (next: DropzoneState) => {
    replaceDropzone(next);
  };

  const runUploadPipeline = async () => {
    const file = dropzone.file;
    if (!file) return;

    setTheater({
      open: true,
      stage: "uploading",
      detail: "Sending clip to Gemini",
      errorMessage: null,
      retryable: false,
    });

    const fd = new FormData();
    fd.set("video", file);
    fd.set("sport", "basketball");
    fd.set("original_call", call ?? "");
    fd.set("original_call_freetext", freetext);

    const analysisPromise = analyzeClipAction(fd);
    await wait(280);
    setTheater((s) => ({
      ...s,
      stage: "understanding",
      detail: "Watching the play",
    }));
    await wait(220);
    setTheater((s) => ({
      ...s,
      stage: "consulting_rulebook",
      detail: "Consulting the NBA rulebook",
    }));

    const result = await analysisPromise;

    if (!result.ok) {
      setTheater({
        open: true,
        stage: "error",
        detail: null,
        errorMessage: result.message,
        retryable: result.retryable,
      });
      return;
    }

    const { understanding, verdict } = result;

    setTheater((s) => ({
      ...s,
      stage: "consulting_rulebook",
      detail: prettifyTags(understanding.candidate_rules),
    }));
    await wait(100);

    setTheater((s) => ({
      ...s,
      stage: "rendering_verdict",
      detail: "Running integrity checks",
    }));
    await wait(220);

    const analysis: FullAnalysis = {
      id: result.analysisId,
      sport: "basketball",
      original_call: call,
      original_call_freetext: freetext.trim() || null,
      video_url: dropzone.objectUrl ?? "",
      is_sample: false,
      understanding,
      verdict,
      created_at: new Date().toISOString(),
    };
    saveAnalysis(analysis);
    setTheater((s) => ({ ...s, stage: "complete" }));
    router.push(`/analyze/${analysis.id}`);
  };

  const submit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await runUploadPipeline();
    } catch (err) {
      console.error(err);
      setTheater({
        open: true,
        stage: "error",
        detail: null,
        errorMessage:
          err instanceof Error
            ? err.message
            : "Something unexpected went wrong.",
        retryable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const dismissTheater = () =>
    setTheater((s) => ({ ...s, open: false, errorMessage: null }));

  const retry = () => {
    setTheater(initialTheater);
    void submit();
  };

  useKeyboardShortcuts(
    React.useMemo(
      () => ({
        r: () => {
          if (!submitting && canSubmit) {
            void submit();
          }
        },
      }),
      [submitting, canSubmit]
    )
  );

  const showTrimmer = Boolean(
    dropzone.file &&
      dropzone.durationSeconds !== null &&
      dropzone.durationSeconds > MAX_ANALYSIS_CLIP_SECONDS
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-10"
      >
        <section className="flex flex-col gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Sport
          </p>
          <SportPicker selected="basketball" />
        </section>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Video clip
          </p>
          <h2 className="mt-2 font-display text-2xl">Upload your play</h2>
          <p className="mt-2 text-sm text-muted">
            Short basketball clip (trim to ≤{MAX_ANALYSIS_CLIP_SECONDS}s if
            needed). Optionally add what the ref called below.
          </p>
        </div>

        <p className="text-sm text-muted">
          Clips on YouTube? Use a downloader like{" "}
          <a
            href="https://y2mate.ws/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline-offset-2 hover:underline"
          >
            Y2Mate
          </a>{" "}
          to save an MP4 (where you&apos;re allowed to), then upload it here.
        </p>

        <VideoDropzone
          value={dropzone}
          onChange={onDropzoneChange}
          disabled={submitting}
          suppressVideoPreview={showTrimmer}
          maxAnalysisSeconds={MAX_ANALYSIS_CLIP_SECONDS}
        />

        {showTrimmer && dropzone.file && dropzone.durationSeconds !== null && (
          <VideoTrimmer
            file={dropzone.file}
            rawDurationSeconds={dropzone.durationSeconds}
            maxDurationSeconds={MAX_ANALYSIS_CLIP_SECONDS}
            onTrimmed={(trimmedFile, start, end) => {
              const nextUrl = URL.createObjectURL(trimmedFile);
              replaceDropzone({
                file: trimmedFile,
                durationSeconds: Math.max(0, end - start),
                objectUrl: nextUrl,
                error: null,
              });
            }}
            onCancel={() =>
              replaceDropzone({
                file: null,
                durationSeconds: null,
                objectUrl: null,
                error: null,
              })
            }
          />
        )}

        <section className="flex flex-col gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Context
          </p>
          <CallInput
            call={call}
            freetext={freetext}
            onCallChange={setCall}
            onFreetextChange={setFreetext}
            disabled={submitting}
          />
        </section>

        <div className="flex flex-col gap-3">
          <Button
            size="xl"
            onClick={submit}
            disabled={!canSubmit || submitting || showTrimmer}
            className="w-full sm:w-auto"
          >
            Analyze clip
            {canSubmit && !showTrimmer && (
              <ArrowRight className="size-4" />
            )}
          </Button>
        </div>
      </motion.div>

      <AnalysisTheater
        open={theater.open}
        stage={theater.stage}
        detail={theater.detail}
        errorMessage={theater.errorMessage}
        onRetry={theater.retryable ? retry : undefined}
        onCancel={dismissTheater}
      />
    </>
  );
}
