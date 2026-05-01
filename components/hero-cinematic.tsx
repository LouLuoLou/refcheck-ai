"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroCinematic() {
  const reduced = useReducedMotion();

  const fade = (delay = 0) => ({
    initial: { opacity: 0, y: reduced ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.8,
      delay,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  });

  return (
    <section className="relative isolate overflow-hidden">
      {/* Background: radial court-line gradient + soft vignette */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% 0%, rgba(245,197,24,0.08), transparent 60%), radial-gradient(800px 400px at 10% 80%, rgba(16,185,129,0.06), transparent 70%), radial-gradient(800px 400px at 90% 80%, rgba(239,68,68,0.05), transparent 70%)",
        }}
      />
      {/* Subtle court-line pattern */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #F5F5F4 1px, transparent 1px), linear-gradient(to bottom, #F5F5F4 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center px-6 py-24 text-center">
        <motion.p
          {...fade(0)}
          className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent"
        >
          GDG BorderHack · 2026
        </motion.p>

        <motion.h1
          {...fade(0.08)}
          className="mt-6 font-display text-[clamp(3.75rem,10vw,9rem)] leading-[0.9] tracking-tight"
        >
          Was it a{" "}
          <span className="italic text-accent">fair call?</span>
        </motion.h1>

        <motion.p
          {...fade(0.18)}
          className="mt-8 max-w-xl text-lg text-muted md:text-xl"
        >
          AI-powered officiating review, grounded in the official NBA rulebook.
          Upload a play. Get a verdict. See the rule.
        </motion.p>

        <motion.div {...fade(0.28)} className="mt-10 flex items-center gap-4">
          <Button asChild size="xl">
            <Link href="/analyze">
              Analyze a Play
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="xl" variant="outline">
            <Link href="/about">How it works</Link>
          </Button>
        </motion.div>

        <motion.p
          {...fade(0.4)}
          className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-muted"
        >
          Built on Google Gemini · Basketball first
        </motion.p>
      </div>
    </section>
  );
}
