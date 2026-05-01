import type { FullAnalysis, PlayUnderstanding } from "@/lib/types";

const KEY = "refcheck:history:v1";
const MAX = 10;

type StoredAnalysis = FullAnalysis;

function read(): StoredAnalysis[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredAnalysis[];
  } catch {
    return [];
  }
}

function write(items: StoredAnalysis[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
  } catch {
    /* quota / unavailable — ignore */
  }
}

export function saveAnalysis(a: FullAnalysis): void {
  const existing = read().filter((x) => x.id !== a.id);
  write([a, ...existing]);
}

export function getAnalysis(id: string): FullAnalysis | undefined {
  return read().find((a) => a.id === id);
}

export function listAnalyses(): FullAnalysis[] {
  return read();
}

// Shallow-merge a patch into the stored analysis.understanding for the given
// id and persist. No-op if the id is missing. Used by the verdict page's
// inline key-event editor.
export function updateAnalysisUnderstanding(
  id: string,
  patch: Partial<PlayUnderstanding>
): void {
  const items = read();
  const idx = items.findIndex((a) => a.id === id);
  if (idx === -1) return;
  const existing = items[idx];
  const merged: FullAnalysis = {
    ...existing,
    understanding: { ...existing.understanding, ...patch },
  };
  const next = [...items];
  next[idx] = merged;
  write(next);
}

// Persist the user-authored "what actually happened" note onto the stored
// analysis. An empty / whitespace-only note clears the field entirely so
// exports don't carry stale placeholder text. No-op if id is missing.
export function updateAnalysisGroundTruth(id: string, note: string): void {
  const items = read();
  const idx = items.findIndex((a) => a.id === id);
  if (idx === -1) return;
  const trimmed = note.trim().slice(0, 1000);
  const existing = items[idx];
  const next = [...items];
  if (trimmed.length === 0) {
    const { ground_truth_note: _unused, ...rest } = existing;
    void _unused;
    next[idx] = rest as FullAnalysis;
  } else {
    next[idx] = { ...existing, ground_truth_note: trimmed };
  }
  write(next);
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
