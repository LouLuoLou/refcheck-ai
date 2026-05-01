"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function LandingVerdictTeaser() {
  const reduced = useReducedMotion();

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
          The verdict
        </p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl max-w-3xl">
          Every answer is cited,{" "}
          <span className="italic text-accent">verbatim</span>, from the
          rulebook.
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface shadow-[var(--shadow-card)]"
      >
        <div className="grid grid-cols-1 gap-0 md:grid-cols-[1.1fr_1fr]">
          {/* Left: faux video panel */}
          <div className="relative min-h-[280px] border-border-subtle bg-background md:border-r">
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #F5F5F4 1px, transparent 1px), linear-gradient(to bottom, #F5F5F4 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
            <div className="relative flex h-full min-h-[280px] flex-col justify-end gap-3 p-6">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  Sample · Drive baseline · 0:18
                </span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-border-subtle">
                <span className="absolute left-[18%] top-1/2 size-2 -translate-y-1/2 rounded-full bg-accent" />
                <span className="absolute left-[44%] top-1/2 size-2 -translate-y-1/2 rounded-full bg-accent" />
                <span className="absolute left-[66%] top-1/2 size-2 -translate-y-1/2 rounded-full bg-accent" />
                <span className="absolute left-[82%] top-1/2 size-2 -translate-y-1/2 rounded-full bg-accent" />
              </div>
            </div>
          </div>

          {/* Right: verdict preview */}
          <div className="flex flex-col gap-5 p-6 md:p-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-verdict-fair/40 bg-verdict-fair/10 px-3 py-1">
              <CheckCircle2 className="size-3.5 text-verdict-fair" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-verdict-fair">
                Fair call
              </span>
            </div>

            <h3 className="font-display text-3xl leading-tight md:text-4xl">
              Defender established verticality before contact.
            </h3>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-border-subtle">
                <div
                  className="h-full rounded-full bg-verdict-fair"
                  style={{ width: "82%" }}
                />
              </div>
              <span className="font-mono text-sm tabular-nums text-foreground">
                82
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                High
              </span>
            </div>

            <blockquote className="rounded-lg border-l-2 border-accent bg-background/50 px-4 py-3">
              <p className="text-sm text-muted leading-relaxed">
                “A defender shall be entitled to a vertical position even
                extending his arms above his shoulders, as when shooting a shot
                or jumping.”
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                NBA Rule 12 · §B.I.e · Verticality
              </p>
            </blockquote>

            <Link
              href="/analyze"
              className="inline-flex w-fit items-center gap-2 text-sm text-foreground underline decoration-accent/60 underline-offset-4 hover:decoration-accent"
            >
              Try it with a real clip
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
