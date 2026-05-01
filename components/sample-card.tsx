"use client";

import { cn } from "@/lib/utils";
import type { Sample } from "@/lib/types";
import { BASKETBALL_CALL_LABELS } from "@/lib/types";
import { Check } from "lucide-react";

export function SampleCard({
  sample,
  selected,
  onSelect,
}: {
  sample: Sample;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const verdictColor =
    sample.prebaked.verdict.verdict === "FAIR_CALL"
      ? "text-verdict-fair"
      : sample.prebaked.verdict.verdict === "BAD_CALL"
        ? "text-verdict-bad"
        : "text-verdict-inconclusive";

  const verdictLabel =
    sample.prebaked.verdict.verdict === "FAIR_CALL"
      ? "Fair"
      : sample.prebaked.verdict.verdict === "BAD_CALL"
        ? "Bad"
        : "Inconclusive";

  return (
    <button
      type="button"
      onClick={() => onSelect(sample.id)}
      aria-pressed={selected}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border bg-surface text-left shadow-[var(--shadow-card)] transition-all",
        selected
          ? "border-accent ring-2 ring-accent/40"
          : "border-border-subtle hover:border-border-strong"
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-background">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sample.poster}
          alt=""
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/80 px-2 py-1 backdrop-blur">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
            {sample.duration_seconds}s
          </span>
        </div>
        {selected && (
          <div className="absolute right-3 top-3 inline-flex size-6 items-center justify-center rounded-full bg-accent text-accent-ink">
            <Check className="size-3.5" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.2em]",
              verdictColor
            )}
          >
            {verdictLabel}
          </span>
          <span className="text-border-subtle">·</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            {sample.original_call
              ? BASKETBALL_CALL_LABELS[sample.original_call]
              : "No call"}
          </span>
        </div>
        <h3 className="font-display text-xl leading-tight">{sample.title}</h3>
        <p className="text-sm text-muted leading-relaxed">{sample.tagline}</p>
      </div>
    </button>
  );
}
