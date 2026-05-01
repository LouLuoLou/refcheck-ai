"use client";

import * as React from "react";
import type { KeyEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  events: KeyEvent[];
  videoRef: React.RefObject<HTMLVideoElement | null>;
  duration: number | null;
};

export function KeyEventsTimeline({ events, videoRef, duration }: Props) {
  const [currentTime, setCurrentTime] = React.useState(0);
  const effectiveDuration = React.useMemo(() => {
    if (duration && duration > 0) return duration;
    const fromEvents = events.reduce(
      (max, e) => Math.max(max, e.t_seconds),
      0
    );
    return fromEvents > 0 ? fromEvents + 1 : 10;
  }, [duration, events]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => setCurrentTime(video.currentTime);
    video.addEventListener("timeupdate", onTime);
    return () => video.removeEventListener("timeupdate", onTime);
  }, [videoRef]);

  const seekTo = (t: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = t;
    void video.play().catch(() => {
      /* autoplay restrictions - ignore */
    });
  };

  if (events.length === 0) return null;

  const progressPct = Math.min(
    100,
    Math.max(0, (currentTime / effectiveDuration) * 100)
  );

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border-subtle bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          Key events
        </p>
        <p className="font-mono text-[10px] tabular-nums text-muted">
          {currentTime.toFixed(1)}s · {effectiveDuration.toFixed(1)}s
        </p>
      </div>

      <div className="relative h-10 select-none">
        <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-border-subtle" />
        <div
          className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2 rounded-full bg-accent/60"
          style={{ width: `${progressPct}%` }}
        />
        {events.map((e, i) => {
          const pct = Math.min(
            100,
            Math.max(0, (e.t_seconds / effectiveDuration) * 100)
          );
          return (
            <button
              key={i}
              type="button"
              onClick={() => seekTo(e.t_seconds)}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pct}%` }}
              aria-label={`Jump to ${e.event} at ${e.t_seconds.toFixed(1)}s`}
            >
              <span className="flex size-3 items-center justify-center rounded-full border border-accent bg-background transition-all hover:scale-125 hover:bg-accent">
                <span className="size-1 rounded-full bg-accent" />
              </span>
            </button>
          );
        })}
      </div>

      <ul className="space-y-1.5">
        {events.map((e, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => seekTo(e.t_seconds)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-2 py-1 text-left font-mono text-xs transition-colors hover:bg-background/40",
                Math.abs(currentTime - e.t_seconds) < 0.25
                  ? "text-foreground"
                  : "text-muted"
              )}
            >
              <span className="w-10 text-accent tabular-nums">
                {e.t_seconds.toFixed(1)}s
              </span>
              <span>{e.event}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
