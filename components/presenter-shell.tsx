"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useDemoMode } from "@/lib/demo-mode";
import { useKeyboardShortcuts } from "@/lib/shortcuts";
import { PresenterHUD } from "@/components/presenter-hud";
import { ShortcutsDialog } from "@/components/shortcuts-dialog";

export function PresenterShell({ children }: { children: React.ReactNode }) {
  const { ready, demoMode, presenterMode, toggleDemo, togglePresenter } =
    useDemoMode();
  const pathname = usePathname();
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);

  useKeyboardShortcuts(
    React.useMemo(
      () => ({
        shiftD: toggleDemo,
        p: togglePresenter,
        question: () => setShortcutsOpen(true),
        escape: () => setShortcutsOpen(false),
      }),
      [toggleDemo, togglePresenter]
    )
  );

  // Apply presenter-mode class to html for typography/chrome tweaks
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("presenter", presenterMode);
    document.documentElement.classList.toggle("demo", demoMode);
  }, [presenterMode, demoMode]);

  const hudVisible = ready && (demoMode || presenterMode);

  const samplesShortcuts = pathname === "/analyze";

  return (
    <>
      {children}
      <PresenterHUD
        visible={hudVisible}
        demoMode={demoMode}
        presenterMode={presenterMode}
        sampleLabel={samplesShortcuts ? "use ← → to browse samples" : null}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />
      <ShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />
    </>
  );
}
