"use client";

import * as React from "react";
import { Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KeyEvent } from "@/lib/types";

type Props = {
  events: KeyEvent[];
  originalEvents: KeyEvent[];
  onSave: (events: KeyEvent[]) => void;
  onCancel: () => void;
};

type Row = {
  t_seconds: string;
  event: string;
};

function toRows(events: KeyEvent[]): Row[] {
  return events.map((e) => ({
    t_seconds: e.t_seconds.toFixed(1),
    event: e.event,
  }));
}

function snapToTenth(n: number): number {
  return Math.round(n * 10) / 10;
}

export function KeyEventsEditor({
  events,
  originalEvents,
  onSave,
  onCancel,
}: Props) {
  const [rows, setRows] = React.useState<Row[]>(() => toRows(events));

  const handleChange = (idx: number, field: keyof Row, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleDelete = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAdd = () => {
    const lastT =
      rows.length > 0
        ? parseFloat(rows[rows.length - 1].t_seconds) || 0
        : 0;
    setRows((prev) => [
      ...prev,
      { t_seconds: snapToTenth(lastT + 0.5).toFixed(1), event: "" },
    ]);
  };

  const handleReset = () => {
    setRows(toRows(originalEvents));
  };

  const handleSave = () => {
    const cleaned = rows
      .map((r) => {
        const raw = parseFloat(r.t_seconds);
        const t = Number.isFinite(raw) ? snapToTenth(Math.max(0, Math.min(60, raw))) : 0;
        const ev = r.event.trim().slice(0, 80);
        return { t_seconds: t, event: ev };
      })
      .filter((r) => r.event.length > 0)
      .sort((a, b) => a.t_seconds - b.t_seconds);
    onSave(cleaned);
  };

  return (
    <div className="rounded-[var(--radius-card)] border border-accent/40 bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Correcting key events
          </p>
          <p className="mt-1 text-xs text-muted">
            Adjust timestamps, add missed beats, or remove inaccuracies.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleReset}
            aria-label="Reset to AI timings"
          >
            <RotateCcw className="size-3.5" />
            Reset to AI
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onCancel}
            aria-label="Cancel editing"
          >
            <X className="size-3.5" />
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            variant="primary"
            onClick={handleSave}
            aria-label="Save changes"
          >
            <Save className="size-3.5" />
            Save
          </Button>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {rows.length === 0 && (
          <li className="rounded-md border border-dashed border-border-subtle px-3 py-4 text-center text-xs text-muted">
            No events. Add one below.
          </li>
        )}
        {rows.map((row, i) => (
          <li
            key={i}
            className="flex items-center gap-2 rounded-md border border-border-subtle bg-background/40 p-2"
          >
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                max="60"
                value={row.t_seconds}
                onChange={(e) =>
                  handleChange(i, "t_seconds", e.target.value)
                }
                className="w-[88px] rounded-md border border-border-subtle bg-background px-2 py-1 font-mono text-xs tabular-nums text-accent focus:border-accent focus:outline-none"
                aria-label="Timestamp in seconds"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted">
                s
              </span>
            </div>
            <input
              type="text"
              maxLength={80}
              value={row.event}
              onChange={(e) => handleChange(i, "event", e.target.value)}
              placeholder="Event description"
              className="min-w-0 flex-1 rounded-md border border-border-subtle bg-background px-2 py-1 text-xs text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none"
              aria-label="Event description"
            />
            <button
              type="button"
              onClick={() => handleDelete(i)}
              className="inline-flex size-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-background hover:text-verdict-bad"
              aria-label={`Delete event at ${row.t_seconds}s`}
            >
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={handleAdd}
        className="mt-3 inline-flex items-center gap-2 rounded-md border border-dashed border-border-subtle px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
      >
        <Plus className="size-3.5" />
        Add event
      </button>
    </div>
  );
}
