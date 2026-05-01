"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SportPicker } from "@/components/sport-picker";
import { SampleLibrary } from "@/components/sample-library";
import { VideoDropzone, type DropzoneState } from "@/components/video-dropzone";
import { CallInput } from "@/components/call-input";
import { Button } from "@/components/ui/button";
import {
  AnalysisTheater,
  type TheaterStage,
} from "@/components/analysis-theater";
import { findSample } from "@/lib/samples";
import { saveAnalysis } from "@/lib/session";
import type { BasketballCall, FullAnalysis } from "@/lib/types";
import { uid } from "@/lib/utils";
import { describePlayAction } from "@/actions/describe-play";
import { synthesizeVerdictAction } from "@/actions/synthesize-verdict";
import { useKeyboardShortcuts } from "@/lib/shortcuts";
import { SAMPLES } from "@/lib/samples";

type SubmitMode = "sample" | "upload" | null;

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

  const [selectedSampleId, setSelectedSampleId] = React.useState<string | null>(
    null
  );
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

  const mode: SubmitMode = selectedSampleId
    ? "sample"
    : dropzone.file
      ? "upload"
      : null;

  React.useEffect(() => {
    if (selectedSampleId) {
      const sample = findSample(selectedSampleId);
      if (sample) setCall(sample.original_call);
    }
  }, [selectedSampleId]);

  const onSelectSample = (id: string) => {
    if (selectedSampleId === id) {
      setSelectedSampleId(null);
      setCall(null);
      return;
    }
    setSelectedSampleId(id);
    if (dropzone.file) {
      setDropzone({
        file: null,
        durationSeconds: null,
        objectUrl: null,
        error: null,
      });
    }
  };

  const onDropzoneChange = (next: DropzoneState) => {
    setDropzone(next);
    if (next.file && selectedSampleId) setSelectedSampleId(null);
  };

  const runSamplePipeline = async () => {
    const sample = findSample(selectedSampleId!);
    if (!sample) {
      setTheater({
        open: true,
        stage: "error",
        detail: null,
        errorMessage: "That sample could not be loaded.",
        retryable: false,
      });
      return;
    }

    setTheater({
      open: true,
      stage: "uploading",
      detail: "Loading sample clip…",
      errorMessage: null,
      retryable: false,
    });
    await wait(1100);

    setTheater((s) => ({
      ...s,
      stage: "understanding",
      detail: "Identifying players and contact",
    }));
    await wait(1300);

    setTheater((s) => ({
      ...s,
      stage: "consulting_rulebook",
      detail: prettifyTags(sample.prebaked.understanding.candidate_rules),
    }));
    await wait(1100);

    setTheater((s) => ({
      ...s,
      stage: "rendering_verdict",
      detail: "Running integrity checks",
    }));
    await wait(700);

    const analysis: FullAnalysis = {
      ...sample.prebaked,
      id: uid(),
      original_call: call,
      original_call_freetext: freetext.trim() || null,
      created_at: new Date().toISOString(),
    };
    saveAnalysis(analysis);
    setTheater((s) => ({ ...s, stage: "complete" }));
    router.push(`/analyze/${analysis.id}`);
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

    const describePromise = describePlayAction(fd);
    // Pace so stage 1 is visible even when the upload is fast.
    await wait(1200);
    setTheater((s) => ({
      ...s,
      stage: "understanding",
      detail: "Watching the play",
    }));

    const describe = await describePromise;

    if (!describe.ok) {
      setTheater({
        open: true,
        stage: "error",
        detail: null,
        errorMessage: describe.message,
        retryable: describe.retryable,
      });
      return;
    }

    const understanding = describe.understanding;
    const previewEvent =
      understanding.key_events[0]?.event ??
      understanding.play_description.slice(0, 80);

    setTheater((s) => ({
      ...s,
      stage: "understanding",
      detail: previewEvent,
    }));
    await wait(500);

    setTheater((s) => ({
      ...s,
      stage: "consulting_rulebook",
      detail: prettifyTags(understanding.candidate_rules),
    }));

    const synth = await synthesizeVerdictAction({
      understanding,
      original_call: call,
      original_call_freetext: freetext.trim() || null,
    });

    if (!synth.ok) {
      setTheater({
        open: true,
        stage: "error",
        detail: null,
        errorMessage: synth.message,
        retryable: synth.retryable,
      });
      return;
    }

    setTheater((s) => ({
      ...s,
      stage: "rendering_verdict",
      detail: "Running integrity checks",
    }));
    await wait(700);

    const analysis: FullAnalysis = {
      id: describe.analysisId,
      sport: "basketball",
      original_call: call,
      original_call_freetext: freetext.trim() || null,
      video_url: dropzone.objectUrl ?? "",
      is_sample: false,
      understanding,
      verdict: synth.verdict,
      created_at: new Date().toISOString(),
    };
    saveAnalysis(analysis);
    setTheater((s) => ({ ...s, stage: "complete" }));
    router.push(`/analyze/${analysis.id}`);
  };

  const submit = async () => {
    if (!mode || submitting) return;
    setSubmitting(true);
    try {
      if (mode === "sample") {
        await runSamplePipeline();
      } else {
        await runUploadPipeline();
      }
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

  const cycleSample = React.useCallback(
    (direction: 1 | -1) => {
      if (submitting) return;
      const ids = SAMPLES.map((s) => s.id);
      if (ids.length === 0) return;
      const current = selectedSampleId ? ids.indexOf(selectedSampleId) : -1;
      const next = (current + direction + ids.length) % ids.length;
      setSelectedSampleId(ids[next]);
      if (dropzone.file) {
        setDropzone({
          file: null,
          durationSeconds: null,
          objectUrl: null,
          error: null,
        });
      }
    },
    [submitting, selectedSampleId, dropzone.file]
  );

  useKeyboardShortcuts(
    React.useMemo(
      () => ({
        left: () => cycleSample(-1),
        right: () => cycleSample(1),
        r: () => {
          if (!submitting && mode) {
            void submit();
          }
        },
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [cycleSample, submitting, mode]
    )
  );

  const buttonLabel =
    mode === "sample"
      ? "Analyze Sample Play"
      : mode === "upload"
        ? "Analyze My Clip"
        : "Select a play or upload a clip";

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

        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                Sample plays
              </p>
              <h2 className="mt-2 font-display text-2xl">
                Four curated plays. Pick one.
              </h2>
            </div>
          </div>
          <SampleLibrary
            selectedId={selectedSampleId}
            onSelect={onSelectSample}
          />
        </section>

        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-border-subtle" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Or upload your own
          </span>
          <span className="h-px flex-1 bg-border-subtle" />
        </div>

        <VideoDropzone
          value={dropzone}
          onChange={onDropzoneChange}
          disabled={submitting || !!selectedSampleId}
        />

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
            disabled={!mode || submitting}
            className="w-full sm:w-auto"
          >
            {buttonLabel}
            {mode && <ArrowRight className="size-4" />}
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
