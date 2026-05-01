"use client";

import * as React from "react";
import { CheckCircle2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  initialNote: string;
  onSave: (note: string) => void;
};

const MAX = 1000;

export function GroundTruthNote({ initialNote, onSave }: Props) {
  const [note, setNote] = React.useState(initialNote);
  const [saved, setSaved] = React.useState(false);
  const savedTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  React.useEffect(() => {
    setNote(initialNote);
  }, [initialNote]);

  React.useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const commit = React.useCallback(() => {
    const next = note.slice(0, MAX);
    if (next === initialNote) return;
    onSave(next);
    setSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 1500);
  }, [note, initialNote, onSave]);

  return (
    <div className="rounded-[var(--radius-card)] border border-accent/25 bg-accent/5 p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-3.5 text-muted" />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          What actually happened?
        </p>
      </div>
      <p className="mt-1.5 text-xs text-muted">
        Write the real outcome in your own words. This is exported alongside
        the AI verdict as ground-truth calibration data.
      </p>

      <textarea
        value={note}
        maxLength={MAX}
        rows={3}
        onChange={(e) => setNote(e.target.value)}
        onBlur={commit}
        placeholder="e.g. No contact. Defender stayed vertical. The no-call was correct."
        className="mt-3 w-full resize-y rounded-md border border-border-subtle bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none"
      />

      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] tabular-nums text-muted">
          {note.length} / {MAX}
        </span>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-verdict-fair">
              <CheckCircle2 className="size-3" />
              Saved
            </span>
          )}
          <Button
            type="button"
            size="sm"
            variant="primary"
            onClick={commit}
            disabled={note === initialNote}
          >
            Save note
          </Button>
        </div>
      </div>
    </div>
  );
}
