import Link from "next/link";
import { SystemStatusDot } from "@/components/system-status-dot";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border-subtle/60 bg-surface/40">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="font-display text-xl">RefCheck AI</div>
            <p className="mt-2 text-sm text-muted max-w-xs">
              AI-powered officiating review, grounded in the official NBA
              rulebook. Built for GDG BorderHack 2026.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Product
            </span>
            <Link
              href="/analyze"
              className="text-muted hover:text-foreground transition-colors"
            >
              Analyze a play
            </Link>
            <Link
              href="/about"
              className="text-muted hover:text-foreground transition-colors"
            >
              How it works
            </Link>
            <a
              href="https://official.nba.com/rulebook/"
              target="_blank"
              rel="noreferrer"
              className="text-muted hover:text-foreground transition-colors"
            >
              NBA Official Rulebook
            </a>
          </div>

          <div className="flex flex-col gap-3 text-sm md:items-end">
            <SystemStatusDot />
            <span className="text-muted">
              Built on{" "}
              <a
                href="https://ai.google.dev"
                target="_blank"
                rel="noreferrer"
                className="text-foreground hover:text-accent transition-colors"
              >
                Google Gemini
              </a>
              .
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              GDG BorderHack · 2026
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
