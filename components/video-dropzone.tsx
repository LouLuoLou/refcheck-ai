"use client";

import * as React from "react";
import { Upload, X, FilmIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_SIZE = 10 * 1024 * 1024;
const MAX_DURATION = 20;

export type DropzoneState = {
  file: File | null;
  durationSeconds: number | null;
  objectUrl: string | null;
  error: string | null;
};

async function probeDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      const el = document.createElement("video");
      el.preload = "metadata";
      el.muted = true;
      const url = URL.createObjectURL(file);
      el.src = url;
      const cleanup = () => {
        URL.revokeObjectURL(url);
        el.remove();
      };
      el.onloadedmetadata = () => {
        const d = el.duration;
        cleanup();
        resolve(Number.isFinite(d) ? d : null);
      };
      el.onerror = () => {
        cleanup();
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

export function VideoDropzone({
  value,
  onChange,
  disabled,
}: {
  value: DropzoneState;
  onChange: (state: DropzoneState) => void;
  disabled?: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [hover, setHover] = React.useState(false);

  const handleFile = React.useCallback(
    async (raw: File | null | undefined) => {
      if (!raw) return;

      if (!ACCEPTED_TYPES.includes(raw.type)) {
        onChange({
          file: null,
          durationSeconds: null,
          objectUrl: null,
          error: "Please upload an MP4, MOV, or WEBM.",
        });
        return;
      }

      if (raw.size > MAX_SIZE) {
        onChange({
          file: null,
          durationSeconds: null,
          objectUrl: null,
          error: "That file is too large. Please keep clips under 10 MB.",
        });
        return;
      }

      const duration = await probeDuration(raw);
      if (duration !== null && duration > MAX_DURATION) {
        onChange({
          file: null,
          durationSeconds: null,
          objectUrl: null,
          error: "That clip is too long. Please keep it under 20 seconds.",
        });
        return;
      }

      const objectUrl = URL.createObjectURL(raw);
      onChange({
        file: raw,
        durationSeconds: duration,
        objectUrl,
        error: null,
      });
    },
    [onChange]
  );

  const clear = () => {
    if (value.objectUrl) URL.revokeObjectURL(value.objectUrl);
    onChange({ file: null, durationSeconds: null, objectUrl: null, error: null });
    if (inputRef.current) inputRef.current.value = "";
  };

  if (value.file) {
    return (
      <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border-subtle bg-surface p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background">
              <FilmIcon className="size-4 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {value.file.name}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                {(value.file.size / (1024 * 1024)).toFixed(2)} MB
                {value.durationSeconds !== null && (
                  <> · {value.durationSeconds.toFixed(1)}s</>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={clear}
            disabled={disabled}
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-background hover:text-foreground disabled:opacity-40"
            aria-label="Remove uploaded clip"
          >
            <X className="size-4" />
          </button>
        </div>
        {value.objectUrl && (
          <video
            src={value.objectUrl}
            className="w-full rounded-lg"
            controls
            muted
            playsInline
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          setHover(false);
          const file = e.dataTransfer.files?.[0];
          void handleFile(file);
        }}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border-2 border-dashed px-6 py-12 text-center transition-colors",
          hover
            ? "border-accent bg-accent/5"
            : "border-border-subtle bg-surface/50 hover:border-border-strong hover:bg-surface",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <div className="flex size-12 items-center justify-center rounded-full bg-background">
          <Upload className="size-5 text-accent" />
        </div>
        <div className="space-y-1">
          <p className="text-base text-foreground">
            Drop a clip here, or click to upload
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            MP4 · MOV · WEBM — up to 20s — up to 10 MB
          </p>
        </div>
      </label>
      {value.error && (
        <p className="text-sm text-verdict-bad" role="alert">
          {value.error}
        </p>
      )}
    </div>
  );
}
