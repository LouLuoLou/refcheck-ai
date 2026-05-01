"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { RuleCitation } from "@/lib/types";

export function RuleCitationCard({
  citation,
  index,
}: {
  citation: RuleCitation;
  index: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.blockquote
      initial={{ opacity: 0, y: reduced ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: 0.55 + index * 0.06,
        ease: "easeOut",
      }}
      className="group relative rounded-[var(--radius-card)] border border-border-subtle bg-surface p-5 transition-colors hover:border-border-strong"
    >
      <p className="text-sm leading-relaxed text-foreground">
        <span className="font-display text-lg text-accent leading-none">
          “
        </span>
        {citation.quote}
        <span className="font-display text-lg text-accent leading-none">
          ”
        </span>
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          NBA · {citation.section} · {citation.title}
        </p>
        {citation.source_url && (
          <a
            href={citation.source_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-accent"
          >
            Source
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    </motion.blockquote>
  );
}
