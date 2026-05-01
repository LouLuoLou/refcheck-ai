"use client";

import * as React from "react";
import type { FullAnalysis } from "@/lib/types";

type Props = {
  analysis: FullAnalysis;
};

const VERDICT_LABEL: Record<FullAnalysis["verdict"]["verdict"], string> = {
  FAIR_CALL: "FAIR CALL",
  BAD_CALL: "BAD CALL",
  INCONCLUSIVE: "INCONCLUSIVE",
};

const VERDICT_COLOR: Record<FullAnalysis["verdict"]["verdict"], string> = {
  FAIR_CALL: "#10b981",
  BAD_CALL: "#ef4444",
  INCONCLUSIVE: "#f59e0b",
};

// Renders a 1200x630 card suitable for PNG export. Uses inline styles only
// (no Tailwind variables) so html2canvas produces a faithful snapshot without
// hitting font-loading or CSS-variable edge cases.
export const VerdictCardForExport = React.forwardRef<HTMLDivElement, Props>(
  function VerdictCardForExport({ analysis }, ref) {
    const v = analysis.verdict;
    const color = VERDICT_COLOR[v.verdict];
    const topCitation = v.rule_citations[0];

    return (
      <div
        ref={ref}
        style={{
          width: 1200,
          height: 630,
          background: "#0a0a0b",
          color: "#f5f5f4",
          padding: 64,
          fontFamily:
            "'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Top: brand + verdict badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily:
                "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 14,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#a8a29e",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#f5c518",
              }}
            />
            REFCHECK AI
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              border: `2px solid ${color}`,
              background: `${color}15`,
              color,
              borderRadius: 999,
              padding: "10px 24px",
              fontFamily:
                "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 16,
              letterSpacing: "0.2em",
              fontWeight: 600,
            }}
          >
            {VERDICT_LABEL[v.verdict]}
          </div>
        </div>

        {/* Middle: headline */}
        <div style={{ paddingRight: 40 }}>
          <div
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 64,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            {v.headline}
          </div>
        </div>

        {/* Bottom: confidence + top citation */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 40,
          }}
        >
          <div style={{ flex: 1, maxWidth: 640 }}>
            {topCitation && (
              <>
                <div
                  style={{
                    fontFamily:
                      "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 11,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    color: "#a8a29e",
                    marginBottom: 10,
                  }}
                >
                  {topCitation.section}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    lineHeight: 1.4,
                    color: "#f5f5f4",
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{truncate(topCitation.quote, 180)}&rdquo;
                </div>
              </>
            )}
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily:
                  "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 11,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#a8a29e",
                marginBottom: 10,
              }}
            >
              Confidence
            </div>
            <div
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 72,
                lineHeight: 1,
                color: "#f5c518",
                fontWeight: 400,
              }}
            >
              {v.confidence_score}
              <span style={{ fontSize: 32, color: "#a8a29e" }}>%</span>
            </div>
            <div
              style={{
                fontFamily:
                  "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 14,
                color,
                marginTop: 4,
              }}
            >
              {v.confidence_label}
            </div>
          </div>
        </div>

        {/* Accent glow corner */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 360,
            height: 360,
            background: `radial-gradient(closest-side, ${color}33, transparent)`,
            pointerEvents: "none",
          }}
        />
      </div>
    );
  }
);

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "\u2026";
}
