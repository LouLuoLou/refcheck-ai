"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, Presentation, Tv } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  visible: boolean;
  demoMode: boolean;
  presenterMode: boolean;
  sampleLabel?: string | null;
  onOpenShortcuts: () => void;
};

export function PresenterHUD({
  visible,
  demoMode,
  presenterMode,
  sampleLabel,
  onOpenShortcuts,
}: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-border-subtle bg-surface/90 px-3 py-2 shadow-[var(--shadow-card)] backdrop-blur"
        >
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em]",
              demoMode
                ? "bg-accent/20 text-accent"
                : "bg-background text-muted"
            )}
          >
            <Tv className="size-3" />
            Demo {demoMode ? "on" : "off"}
          </span>
          {presenterMode && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-verdict-fair/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-verdict-fair">
              <Presentation className="size-3" />
              Presenter
            </span>
          )}
          {sampleLabel && (
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:inline">
              · {sampleLabel}
            </span>
          )}
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:border-border-strong hover:text-foreground"
          >
            <Keyboard className="size-3" />
            Shortcuts
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
