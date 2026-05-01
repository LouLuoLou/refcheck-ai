"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type HealthState = "loading" | "ok" | "degraded" | "down";

export function SystemStatusDot({ className }: { className?: string }) {
  const [state, setState] = React.useState<HealthState>("loading");
  const [reason, setReason] = React.useState<string>("Checking…");

  React.useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const data = (await res.json()) as {
          ok: boolean;
          reason?: string;
        };
        if (cancelled) return;
        if (data.ok) {
          setState("ok");
          setReason("System OK");
        } else {
          setState("degraded");
          setReason(data.reason ?? "Degraded");
        }
      } catch {
        if (cancelled) return;
        setState("down");
        setReason("Offline");
      }
    }

    check();
    const interval = setInterval(check, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const color =
    state === "ok"
      ? "bg-verdict-fair"
      : state === "loading"
        ? "bg-muted"
        : state === "degraded"
          ? "bg-verdict-inconclusive"
          : "bg-verdict-bad";

  const label =
    state === "ok"
      ? "API: healthy"
      : state === "loading"
        ? "API: checking"
        : state === "degraded"
          ? "API: degraded"
          : "API: offline";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted",
        className
      )}
      title={reason}
      aria-live="polite"
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          color,
          state === "ok" && "shadow-[0_0_0_3px_rgb(16_185_129_/_0.2)]"
        )}
      />
      <span>{label}</span>
    </div>
  );
}
