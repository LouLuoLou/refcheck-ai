"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function formatTs(seconds: number): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  const whole = Math.floor(r);
  const frac = Math.round((r - whole) * 10);
  return `${String(m).padStart(2, "0")}:${String(whole).padStart(2, "0")}.${frac}`;
}

type VideoTrimmerProps = {
  file: File;
  rawDurationSeconds: number;
  maxDurationSeconds?: number;
  onTrimmed: (trimmedFile: File, trimStart: number, trimEnd: number) => void;
  onCancel: () => void;
};

export function VideoTrimmer({
  file,
  rawDurationSeconds,
  maxDurationSeconds = 10,
  onTrimmed,
  onCancel,
}: VideoTrimmerProps) {
  const raw = Math.max(0.1, rawDurationSeconds);
  const maxW = maxDurationSeconds;

  const [trimStart, setTrimStart] = React.useState(0);
  const [trimEnd, setTrimEnd] = React.useState(() =>
    Math.min(maxW, raw)
  );
  const [cutting, setCutting] = React.useState(false);
  const [ffmpegError, setFfmpegError] = React.useState<string | null>(null);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const u = URL.createObjectURL(file);
    setObjectUrl(u);
    return () => {
      URL.revokeObjectURL(u);
      setObjectUrl(null);
    };
  }, [file]);

  React.useEffect(() => {
    setTrimStart(0);
    setTrimEnd(Math.min(maxW, raw));
  }, [file, raw, maxW]);

  const clampPair = React.useCallback(
    (nextStart: number, nextEnd: number, moved: "start" | "end") => {
      let s = Math.max(0, Math.min(nextStart, raw - 0.1));
      let e = Math.min(raw, Math.max(nextEnd, s + 0.1));
      if (e - s > maxW) {
        if (moved === "start") {
          e = Math.min(raw, s + maxW);
        } else {
          s = Math.max(0, e - maxW);
        }
      }
      return { s, e };
    },
    [raw, maxW]
  );

  const onStartChange = (v: number) => {
    const { s, e } = clampPair(v, trimEnd, "start");
    setTrimStart(s);
    setTrimEnd(e);
    const el = videoRef.current;
    if (el) {
      el.currentTime = s;
      void el.pause();
    }
  };

  const onEndChange = (v: number) => {
    const { s, e } = clampPair(trimStart, v, "end");
    setTrimStart(s);
    setTrimEnd(e);
    const el = videoRef.current;
    if (el) {
      el.currentTime = e;
      void el.pause();
    }
  };

  const runTrim = async () => {
    const el = videoRef.current;
    if (el) {
      el.pause();
    }
    setFfmpegError(null);
    setCutting(true);
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { fetchFile } = await import("@ffmpeg/util");

      const ffmpeg = new FFmpeg();
      await ffmpeg.load();

      await ffmpeg.writeFile("input.mp4", await fetchFile(file));
      await ffmpeg.exec([
        "-ss",
        String(trimStart),
        "-to",
        String(trimEnd),
        "-i",
        "input.mp4",
        "-c",
        "copy",
        "-avoid_negative_ts",
        "make_zero",
        "output.mp4",
      ]);

      const data = await ffmpeg.readFile("output.mp4");
      const bytes =
        data instanceof Uint8Array
          ? data
          : new Uint8Array(data as unknown as ArrayBuffer);
      const base = file.name.replace(/\.[^.]+$/, "");
      const copy = bytes.slice();
      const trimmed = new File([copy], `${base}-trimmed.mp4`, {
        type: "video/mp4",
      });
      onTrimmed(trimmed, trimStart, trimEnd);
    } catch (err) {
      console.error(err);
      setFfmpegError(
        "Couldn't trim this clip in-browser. Try a different format (MP4 with H.264 is most reliable)."
      );
    } finally {
      setCutting(false);
    }
  };

  const selected = trimEnd - trimStart;

  return (
    <div className="relative flex flex-col gap-4 rounded-[var(--radius-card)] border border-border-subtle bg-surface p-4 shadow-[var(--shadow-card)]">
      {cutting && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] bg-background/80 backdrop-blur-sm">
          <Loader2 className="size-8 animate-spin text-accent" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Cutting clip… this takes about 5 seconds.
          </p>
        </div>
      )}

      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        Trim to {maxW}s or less
      </p>

      {objectUrl && (
        <video
          ref={videoRef}
          src={objectUrl}
          className="w-full rounded-lg bg-black"
          controls={false}
          muted
          playsInline
        />
      )}

      <div className="flex flex-col gap-2">
        <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted">
          Start (s)
        </label>
        <input
          type="range"
          min={0}
          max={Math.max(0, raw - 0.1)}
          step={0.1}
          value={trimStart}
          onChange={(e) => onStartChange(Number(e.target.value))}
          disabled={cutting}
          className="w-full"
        />
        <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted">
          End (s)
        </label>
        <input
          type="range"
          min={0.1}
          max={raw}
          step={0.1}
          value={trimEnd}
          onChange={(e) => onEndChange(Number(e.target.value))}
          disabled={cutting}
          className="w-full"
        />
      </div>

      <p className="font-mono text-xs text-foreground">
        {formatTs(trimStart)} → {formatTs(trimEnd)} — {selected.toFixed(1)}s
        selected
      </p>

      {ffmpegError && (
        <p className="text-sm text-verdict-bad" role="alert">
          {ffmpegError}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={runTrim} disabled={cutting}>
          Trim &amp; analyze
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={cutting}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
