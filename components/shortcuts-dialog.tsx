"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

type Shortcut = { keys: string[]; description: string };

const SHORTCUTS: Shortcut[] = [
  { keys: ["Shift", "D"], description: "Toggle demo mode" },
  { keys: ["P"], description: "Toggle presenter mode" },
  { keys: ["R"], description: "Re-run current analysis" },
  { keys: ["F"], description: "Fullscreen verdict card" },
  { keys: ["←", "→"], description: "Cycle through sample plays" },
  { keys: ["?"], description: "Open this dialog" },
  { keys: ["Esc"], description: "Close overlays" },
];

export function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const reduced = useReducedMotion();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{
                  opacity: 0,
                  scale: reduced ? 1 : 0.96,
                  y: reduced ? 0 : 8,
                }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-card)] border border-border-subtle bg-surface p-6 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center justify-between">
                  <Dialog.Title className="font-display text-2xl">
                    Presenter shortcuts
                  </Dialog.Title>
                  <Dialog.Close className="inline-flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-foreground">
                    <X className="size-4" />
                    <span className="sr-only">Close</span>
                  </Dialog.Close>
                </div>
                <Dialog.Description className="mt-1 text-sm text-muted">
                  Quick keys for running a clean demo on stage.
                </Dialog.Description>

                <ul className="mt-6 space-y-3">
                  {SHORTCUTS.map((s) => (
                    <li
                      key={s.keys.join("+")}
                      className="flex items-center justify-between gap-4"
                    >
                      <span className="text-sm text-foreground">
                        {s.description}
                      </span>
                      <span className="flex gap-1">
                        {s.keys.map((k) => (
                          <kbd
                            key={k}
                            className="min-w-[1.75rem] rounded-md border border-border-subtle bg-background px-2 py-0.5 text-center font-mono text-xs text-muted"
                          >
                            {k}
                          </kbd>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
