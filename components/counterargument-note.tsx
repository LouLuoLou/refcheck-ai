"use client";

import { Scale } from "lucide-react";

export function CounterargumentNote({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-dashed border-border-subtle bg-background/40 p-4">
      <Scale className="mt-0.5 size-3.5 shrink-0 text-muted" />
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          Devil&apos;s advocate
        </p>
        <p className="mt-1.5 text-sm italic leading-relaxed text-muted">
          {text}
        </p>
      </div>
    </div>
  );
}
