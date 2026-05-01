"use client";

import { motion, useReducedMotion } from "framer-motion";

export function ReasoningBlock({
  reasoning,
  delay = 0.45,
}: {
  reasoning: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="rounded-[var(--radius-card)] border border-border-subtle bg-surface p-5"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        Why this verdict
      </p>
      <p className="mt-3 text-sm leading-relaxed text-foreground">
        {reasoning}
      </p>
    </motion.div>
  );
}
