"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Film, Brain, BookOpenCheck } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Film,
    title: "Upload or pick a clip",
    body: "Drop in a short video of a basketball play, or use one of our sample plays.",
  },
  {
    num: "02",
    icon: Brain,
    title: "AI analyzes the play",
    body: "Gemini 2.5 watches the clip and describes what happens — neutrally, play-by-play.",
  },
  {
    num: "03",
    icon: BookOpenCheck,
    title: "Rulebook verdict",
    body: "We cross-reference the official NBA rulebook and return a cited, rule-backed verdict.",
  },
];

export function HowItWorksRow() {
  const reduced = useReducedMotion();
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
            How it works
          </p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            A verdict in three steps.
          </h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.5,
              delay: i * 0.08,
              ease: "easeOut",
            }}
            className="group relative flex flex-col gap-4 rounded-[var(--radius-card)] border border-border-subtle bg-surface p-6 shadow-[var(--shadow-card)] transition-colors hover:border-border-strong"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs tracking-[0.2em] text-muted">
                {s.num}
              </span>
              <s.icon className="size-5 text-accent" aria-hidden />
            </div>
            <h3 className="font-display text-2xl leading-tight">{s.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{s.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
