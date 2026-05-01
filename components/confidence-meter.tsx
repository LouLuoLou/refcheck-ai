"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ConfidenceMeter({
  score,
  label,
  barClassName,
  delay = 0.35,
}: {
  score: number;
  label: string;
  barClassName: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (reduced) {
      setDisplay(score);
      return;
    }
    const duration = 800;
    const startAt = performance.now() + delay * 1000;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - startAt) / duration));
      setDisplay(Math.round(score * t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, delay, reduced]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-border-subtle">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{
            duration: 0.8,
            delay,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={cn("h-full rounded-full", barClassName)}
        />
      </div>
      <span className="font-mono text-lg tabular-nums text-foreground min-w-[2ch] text-right">
        {display}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        {label}
      </span>
    </div>
  );
}
