"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type TheaterStage =
  | "uploading"
  | "understanding"
  | "consulting_rulebook"
  | "rendering_verdict"
  | "complete"
  | "error";

type ActiveStage =
  | "uploading"
  | "understanding"
  | "consulting_rulebook"
  | "rendering_verdict";

const STAGE_ORDER: readonly ActiveStage[] = [
  "uploading",
  "understanding",
  "consulting_rulebook",
  "rendering_verdict",
] as const;

const STAGE_META: Record<ActiveStage, { label: string; hint: string[] }> = {
  uploading: {
    label: "Sending clip to Gemini",
    hint: ["Validating file", "Streaming bytes", "Almost there"],
  },
  understanding: {
    label: "Watching the play",
    hint: ["Identifying players", "Tracking movement", "Noting contact"],
  },
  consulting_rulebook: {
    label: "Consulting the NBA rulebook",
    hint: ["Matching candidate rules", "Pulling verbatim sections"],
  },
  rendering_verdict: {
    label: "Synthesizing verdict",
    hint: ["Citing rules", "Running integrity checks"],
  },
};

export function AnalysisTheater({
  open,
  stage,
  detail,
  errorMessage,
  onRetry,
  onCancel,
}: {
  open: boolean;
  stage: TheaterStage;
  detail?: string | null;
  errorMessage?: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
}) {
  const reduced = useReducedMotion();
  const activeIndex = STAGE_ORDER.indexOf(stage as ActiveStage);

  const [hintIndex, setHintIndex] = React.useState(0);
  React.useEffect(() => {
    setHintIndex(0);
    if (stage === "complete" || stage === "error") return;
    const meta = STAGE_META[stage as keyof typeof STAGE_META];
    if (!meta || meta.hint.length < 2) return;
    const iv = setInterval(
      () => setHintIndex((i) => (i + 1) % meta.hint.length),
      1800
    );
    return () => clearInterval(iv);
  }, [stage]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="theater-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 px-6 backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 12, scale: reduced ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl rounded-[var(--radius-card)] border border-border-subtle bg-surface p-8 shadow-[var(--shadow-card)]"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
              RefCheck · Analyzing
            </p>

            {stage === "error" ? (
              <ErrorBlock
                message={errorMessage ?? "Something went wrong."}
                onRetry={onRetry}
                onCancel={onCancel}
              />
            ) : (
              <ActiveBlock
                stage={stage}
                activeIndex={activeIndex}
                detail={detail}
                hintIndex={hintIndex}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ActiveBlock({
  stage,
  activeIndex,
  detail,
  hintIndex,
}: {
  stage: TheaterStage;
  activeIndex: number;
  detail: string | null | undefined;
  hintIndex: number;
}) {
  const meta =
    stage !== "complete" && stage !== "error"
      ? STAGE_META[stage as keyof typeof STAGE_META]
      : null;
  const hint = meta?.hint[hintIndex] ?? "";
  const caption = detail && detail.trim().length > 0 ? detail : hint;

  return (
    <>
      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.h2
            key={stage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="font-display text-3xl leading-tight md:text-4xl"
          >
            {meta?.label ?? "Complete"}
          </motion.h2>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={`cap-${stage}-${caption}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 min-h-[1.5rem] font-mono text-xs uppercase tracking-[0.2em] text-muted"
          >
            {caption}
          </motion.p>
        </AnimatePresence>
      </div>

      <ol className="mt-8 space-y-3">
        {STAGE_ORDER.map((s, i) => {
          const complete = i < activeIndex || stage === "complete";
          const active = i === activeIndex && stage !== "complete";
          const meta = STAGE_META[s];
          return (
            <li key={s} className="flex items-center gap-3">
              <span
                className={cn(
                  "relative flex size-5 shrink-0 items-center justify-center rounded-full border",
                  complete && "border-accent bg-accent text-accent-ink",
                  active && "border-accent bg-background",
                  !complete &&
                    !active &&
                    "border-border-subtle bg-background text-muted"
                )}
              >
                {complete ? (
                  <Check className="size-3" />
                ) : active ? (
                  <Loader2 className="size-3 animate-spin text-accent" />
                ) : (
                  <span className="size-1.5 rounded-full bg-muted/40" />
                )}
              </span>
              <span
                className={cn(
                  "font-mono text-[11px] uppercase tracking-[0.2em]",
                  complete && "text-foreground",
                  active && "text-foreground",
                  !complete && !active && "text-muted"
                )}
              >
                {meta.label}
              </span>
            </li>
          );
        })}
      </ol>
    </>
  );
}

function ErrorBlock({
  message,
  onRetry,
  onCancel,
}: {
  message: string;
  onRetry?: () => void;
  onCancel?: () => void;
}) {
  return (
    <div className="mt-4">
      <h2 className="font-display text-3xl text-foreground">
        We couldn&apos;t finish the analysis.
      </h2>
      <p className="mt-3 text-sm text-muted">{message}</p>
      <div className="mt-6 flex gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink hover:bg-accent/90"
          >
            Try again
          </button>
        )}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border-subtle px-4 text-sm text-foreground hover:border-border-strong"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
