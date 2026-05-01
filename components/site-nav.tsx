import Link from "next/link";
import { SystemStatusDot } from "@/components/system-status-dot";

export function SiteNav() {
  return (
    <header className="relative z-30 border-b border-border-subtle/60 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-base"
          aria-label="RefCheck AI — home"
        >
          <span className="font-display text-2xl leading-none">RefCheck</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
            AI
          </span>
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/analyze"
            className="text-muted transition-colors hover:text-foreground"
          >
            Analyze
          </Link>
          <Link
            href="/about"
            className="text-muted transition-colors hover:text-foreground"
          >
            About
          </Link>
          <SystemStatusDot className="hidden md:inline-flex" />
        </div>
      </nav>
    </header>
  );
}
