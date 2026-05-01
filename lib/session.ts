import type { FullAnalysis } from "@/lib/types";

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

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
