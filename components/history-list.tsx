"use client";

import * as React from "react";
import Link from "next/link";
import { listAnalyses, clearHistory } from "@/lib/session";
import type { FullAnalysis } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

function verdictColor(v: FullAnalysis["verdict"]["verdict"]) {
  if (v === "FAIR_CALL") return "text-verdict-fair";
  if (v === "BAD_CALL") return "text-verdict-bad";
  return "text-verdict-inconclusive";
}

function verdictLabel(v: FullAnalysis["verdict"]["verdict"]) {
  if (v === "FAIR_CALL") return "Fair";
  if (v === "BAD_CALL") return "Bad";
  return "Inconclusive";
}

export function HistoryList() {
  const [items, setItems] = React.useState<FullAnalysis[]>([]);
  const [mounted, setMounted] = React.useState(false);

  const refresh = React.useCallback(() => {
    setItems(listAnalyses());
  }, []);

  React.useEffect(() => {
    setMounted(true);
    refresh();
  }, [refresh]);

  if (!mounted) return null;

  return (
    <section className="mt-16">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            This session
          </p>
          <h2 className="mt-2 font-display text-2xl">Your analyzed plays</h2>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              clearHistory();
              refresh();
            }}
            className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground"
          >
            <Trash2 className="size-3.5" />
            Clear
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-border-subtle px-6 py-10 text-center">
          <p className="text-sm text-muted">
            Your analyzed plays will appear here.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {items.map((a) => (
            <li key={a.id}>
              <Link
                href={`/analyze/${a.id}`}
                className="group flex items-center gap-4 rounded-[var(--radius-card)] border border-border-subtle bg-surface p-4 transition-colors hover:border-border-strong"
              >
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.2em]",
                    verdictColor(a.verdict.verdict)
                  )}
                >
                  {verdictLabel(a.verdict.verdict)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">
                    {a.verdict.headline}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    {a.is_sample ? "Sample · " : ""}
                    Confidence {a.verdict.confidence_score}
                  </p>
                </div>
                <span className="font-mono text-xs text-muted group-hover:text-accent">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
