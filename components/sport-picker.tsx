"use client";

import { cn } from "@/lib/utils";

type SportOption = {
  id: string;
  label: string;
  available: boolean;
};

const SPORTS: SportOption[] = [
  { id: "basketball", label: "Basketball", available: true },
  { id: "soccer", label: "Soccer", available: false },
  { id: "football", label: "Football", available: false },
];

export function SportPicker({ selected = "basketball" }: { selected?: string }) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Sport selection"
    >
      {SPORTS.map((sport) => {
        const isActive = sport.id === selected && sport.available;
        return (
          <button
            key={sport.id}
            type="button"
            disabled={!sport.available}
            aria-pressed={isActive}
            className={cn(
              "inline-flex items-center gap-2 rounded-[var(--radius-pill)] border px-4 py-1.5 text-sm transition-colors",
              isActive &&
                "border-accent bg-accent/10 text-foreground",
              !isActive &&
                sport.available &&
                "border-border-subtle text-muted hover:border-border-strong hover:text-foreground",
              !sport.available &&
                "cursor-not-allowed border-border-subtle/60 text-muted/50"
            )}
          >
            <span>{sport.label}</span>
            {!sport.available && (
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted/60">
                Coming soon
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
