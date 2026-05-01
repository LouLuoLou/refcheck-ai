"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Verdict } from "@/lib/types";

export type VerdictPalette = {
  label: string;
  color: string;
  bg: string;
  border: string;
  bar: string;
  iconBg: string;
};

export function getVerdictPalette(v: Verdict): VerdictPalette {
  if (v === "FAIR_CALL") {
    return {
      label: "Fair call",
      color: "text-verdict-fair",
      bg: "bg-verdict-fair/10",
      border: "border-verdict-fair/40",
      bar: "bg-verdict-fair",
      iconBg: "bg-verdict-fair/20",
    };
  }
  if (v === "BAD_CALL") {
    return {
      label: "Bad call",
      color: "text-verdict-bad",
      bg: "bg-verdict-bad/10",
      border: "border-verdict-bad/40",
      bar: "bg-verdict-bad",
      iconBg: "bg-verdict-bad/20",
    };
  }
  return {
    label: "Inconclusive",
    color: "text-verdict-inconclusive",
    bg: "bg-verdict-inconclusive/10",
    border: "border-verdict-inconclusive/40",
    bar: "bg-verdict-inconclusive",
    iconBg: "bg-verdict-inconclusive/20",
  };
}

export function VerdictBadge({
  verdict,
  className,
}: {
  verdict: Verdict;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const p = getVerdictPalette(verdict);

  return (
    <motion.span
      initial={{ opacity: 0, scale: reduced ? 1 : 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.1,
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em]",
        p.border,
        p.bg,
        p.color,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", p.bar)} />
      Verdict · {p.label}
    </motion.span>
  );
}
