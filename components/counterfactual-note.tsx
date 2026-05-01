"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GitBranch } from "lucide-react";

export function CounterfactualNote({
  text,
  delay = 0.75,
}: {
  text: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="flex gap-3 rounded-[var(--radius-card)] border border-dashed border-border-subtle bg-background/40 p-5"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface">
        <GitBranch className="size-4 text-accent" aria-hidden />
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          What would flip it
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
      </div>
    </motion.div>
  );
}
