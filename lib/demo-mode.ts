"use client";

import * as React from "react";

const DEMO_STORAGE_KEY = "refcheck:demo";
const PRESENTER_STORAGE_KEY = "refcheck:presenter";

function readFlag(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string, value: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function useDemoMode() {
  const [demoMode, setDemoMode] = React.useState(false);
  const [presenterMode, setPresenterMode] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    const demoParam = url.searchParams.get("demo");
    const presenterParam = url.searchParams.get("presenter");

    let initialDemo = readFlag(DEMO_STORAGE_KEY);
    let initialPresenter = readFlag(PRESENTER_STORAGE_KEY);

    if (demoParam === "1") initialDemo = true;
    if (demoParam === "0") initialDemo = false;
    if (presenterParam === "1") initialPresenter = true;
    if (presenterParam === "0") initialPresenter = false;

    setDemoMode(initialDemo);
    setPresenterMode(initialPresenter);
    setReady(true);

    writeFlag(DEMO_STORAGE_KEY, initialDemo);
    writeFlag(PRESENTER_STORAGE_KEY, initialPresenter);
  }, []);

  const toggleDemo = React.useCallback(() => {
    setDemoMode((d) => {
      const next = !d;
      writeFlag(DEMO_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const togglePresenter = React.useCallback(() => {
    setPresenterMode((p) => {
      const next = !p;
      writeFlag(PRESENTER_STORAGE_KEY, next);
      return next;
    });
  }, []);

  return {
    ready,
    demoMode,
    presenterMode,
    toggleDemo,
    togglePresenter,
  };
}
