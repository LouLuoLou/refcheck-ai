"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerdictCardForExport } from "@/components/verdict-card-for-export";
import type { FullAnalysis } from "@/lib/types";

type Props = {
  analysis: FullAnalysis;
};

export function VerdictExportButton({ analysis }: Props) {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = React.useState(false);

  const handleExport = async () => {
    if (!cardRef.current || busy) return;
    setBusy(true);
    try {
      // Lazy-load html2canvas so it doesn't bloat initial bundle.
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0a0a0b",
        scale: 2,
        useCORS: true,
        logging: false,
        width: 1200,
        height: 630,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `refcheck-${analysis.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("PNG export failed:", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleExport}
        disabled={busy}
      >
        {busy ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Rendering…
          </>
        ) : (
          <>
            <Download className="size-3.5" />
            Export PNG
          </>
        )}
      </Button>

      {/* Offscreen render target. Absolutely positioned off-viewport so
          html2canvas can still read layout, but it never interferes with
          the real verdict page UI. */}
      <div
        style={{
          position: "fixed",
          left: -99999,
          top: 0,
          pointerEvents: "none",
          opacity: 0,
        }}
        aria-hidden
      >
        <VerdictCardForExport ref={cardRef} analysis={analysis} />
      </div>
    </>
  );
}
