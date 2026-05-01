"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SpeedOption = 0.25 | 0.5 | 1;
const SPEED_OPTIONS: SpeedOption[] = [0.25, 0.5, 1];

type Props = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  src: string;
  poster?: string;
  onLoadedMetadata?: (duration: number) => void;
};

export function VideoPlayer({ videoRef, src, poster, onLoadedMetadata }: Props) {
  const [speed, setSpeed] = React.useState<SpeedOption>(1);

  const applySpeed = React.useCallback(
    (next: SpeedOption) => {
      setSpeed(next);
      const video = videoRef.current;
      if (video) video.playbackRate = next;
    },
    [videoRef]
  );

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-background shadow-[var(--shadow-card)]">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="aspect-video w-full bg-background"
        controls
        muted
        playsInline
        onLoadedMetadata={(e) => {
          const d = (e.target as HTMLVideoElement).duration;
          if (Number.isFinite(d)) onLoadedMetadata?.(d);
          const video = videoRef.current;
          if (video) video.playbackRate = speed;
        }}
      />
      <div className="flex items-center justify-between gap-3 border-t border-border-subtle bg-surface px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          Playback speed
        </span>
        <div className="flex items-center gap-1">
          {SPEED_OPTIONS.map((opt) => {
            const active = speed === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => applySpeed(opt)}
                className={cn(
                  "rounded-full px-3 py-1 font-mono text-[11px] tabular-nums transition-colors",
                  active
                    ? "bg-accent text-accent-ink"
                    : "bg-background/40 text-muted hover:bg-background hover:text-foreground"
                )}
                aria-pressed={active}
              >
                {opt}x
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
