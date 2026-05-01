"use client";

import * as React from "react";

export type ShortcutHandler = () => void;

export type ShortcutMap = {
  /** Fires on "P". */
  p?: ShortcutHandler;
  /** Fires on "R". */
  r?: ShortcutHandler;
  /** Fires on "F". */
  f?: ShortcutHandler;
  /** Fires on "?" or Shift+/. */
  question?: ShortcutHandler;
  /** Fires on ArrowLeft. */
  left?: ShortcutHandler;
  /** Fires on ArrowRight. */
  right?: ShortcutHandler;
  /** Fires on "Escape". */
  escape?: ShortcutHandler;
  /** Fires on Shift+D. */
  shiftD?: ShortcutHandler;
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts(map: ShortcutMap) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;

      if (e.shiftKey && (e.key === "D" || e.key === "d")) {
        if (map.shiftD) {
          e.preventDefault();
          map.shiftD();
          return;
        }
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        if (map.question) {
          e.preventDefault();
          map.question();
          return;
        }
      }

      switch (e.key) {
        case "Escape":
          if (map.escape) {
            e.preventDefault();
            map.escape();
          }
          return;
        case "ArrowLeft":
          if (map.left) {
            e.preventDefault();
            map.left();
          }
          return;
        case "ArrowRight":
          if (map.right) {
            e.preventDefault();
            map.right();
          }
          return;
        default:
          break;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case "p":
          if (map.p) {
            e.preventDefault();
            map.p();
          }
          break;
        case "r":
          if (map.r) {
            e.preventDefault();
            map.r();
          }
          break;
        case "f":
          if (map.f) {
            e.preventDefault();
            map.f();
          }
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [map]);
}
