import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const m = Math.floor(safe / 60);
  const s = (safe - m * 60).toFixed(1);
  return `${m}:${s.padStart(4, "0")}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Snap a decimal timestamp to the nearest frame boundary. Default 30 fps is
// the safest assumption for typical basketball highlight clips; overriding is
// cheap if we ever ingest 24 fps (film) or 60 fps (slow-mo) clips.
export function snapToFrame(t: number, fps = 30): number {
  if (!Number.isFinite(t) || t < 0) return 0;
  return Math.round(t * fps) / fps;
}

export function uid(): string {
  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis.crypto?.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}
