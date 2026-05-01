"use client";

import * as React from "react";
import { Crosshair } from "lucide-react";
import type { KeyEvent } from "@/lib/types";
import { snapToFrame } from "@/lib/utils";
import { TIMESTAMP_OFFSET_SECONDS } from "@/lib/env";

// Picks the "money moment" from an event list. Prefers events whose label
// mentions contact / foul / set position / shooting / scoring since those are
// what judges want to re-watch. Falls back to the middle event.
export function pickContactEvent(events: KeyEvent[]): KeyEvent | null {
  if (events.length === 0) return null;
  const keyword =
    /contact|foul|charge|block|set|established?|shoots|shot|gather|enters net|scores|rim/i;
  const match = events.find((e) => keyword.test(e.event));
  if (match) return match;
  return events[Math.floor(events.length / 2)] ?? events[0] ?? null;
}

type Props = {
  events: KeyEvent[];
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onJump?: () => void;
};

export const JumpToContactPill = React.forwardRef<
  HTMLButtonElement,
  Props
>(function JumpToContactPill({ events, videoRef, onJump }, ref) {
  const target = React.useMemo(() => pickContactEvent(events), [events]);

  if (!target) return null;

  const handleJump = () => {
    const video = videoRef.current;
    if (!video) return;
    const t = snapToFrame(
      Math.max(0, target.t_seconds + TIMESTAMP_OFFSET_SECONDS)
    );
    video.pause();
    video.currentTime = t;
    video.playbackRate = 0.5;
    void video.play().catch(() => {
      /* autoplay restrictions can bite; already paused at the frame */
    });
    onJump?.();
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleJump}
      className="group inline-flex items-center gap-2 self-start rounded-[var(--radius-pill)] border border-accent/50 bg-accent/10 px-4 py-2 text-xs font-medium text-accent transition-all hover:border-accent hover:bg-accent hover:text-accent-ink"
      aria-label={`Jump to the key moment: ${target.event}`}
    >
      <Crosshair className="size-3.5 transition-transform group-hover:scale-110" />
      <span>Jump to the moment</span>
      <span className="font-mono text-[10px] tabular-nums opacity-70 group-hover:opacity-100">
        {target.t_seconds.toFixed(1)}s
      </span>
    </button>
  );
});
