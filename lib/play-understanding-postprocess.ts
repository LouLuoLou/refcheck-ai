import type { PlayUnderstanding } from "@/lib/types";

// Deterministic post-processor. Even with prompt tightening + Stage 3b,
// Gemini sometimes places "ball enters net" at or near the release frame.
const MAKE_PATTERN =
  /enters net|through net|scores|makes (the )?shot|ball in basket/i;
const RELEASE_PATTERN =
  /releases? shot|shoots|shot release|jumper|jump shot|layup|dunk|floater/i;
const MIN_BALL_FLIGHT_SECONDS = 0.6;
const PUSHED_GAP_SECONDS = 0.9;

function snap(t: number): number {
  return Math.round(t * 10) / 10;
}

// When the model reports observable_contact === "none" but slips "contact"
// language into a key_events entry, overwrite the event string so the UI
// can't contradict itself. Timestamps are preserved.
const CONTACT_WORD_PATTERN =
  /\bcontact|\bhits?\b|\bbumps?\b|\bfouls?\b|\bcollides?|\bstrikes?\b/i;

export function reconcileContactEvents(
  understanding: PlayUnderstanding
): PlayUnderstanding {
  if (understanding.observable_contact !== "none") return understanding;
  const events = understanding.key_events;
  if (!Array.isArray(events) || events.length === 0) return understanding;

  const patched = events.map((e) =>
    CONTACT_WORD_PATTERN.test(e.event)
      ? { ...e, event: "contests shot" }
      : e
  );
  return { ...understanding, key_events: patched };
}

export function enforceBallFlightFloor(
  understanding: PlayUnderstanding
): PlayUnderstanding {
  const events = understanding.key_events;
  if (!Array.isArray(events) || events.length === 0) return understanding;

  const patched = events.map((e) => ({ ...e }));
  const maxT = patched.reduce(
    (max, e) => (e.t_seconds > max ? e.t_seconds : max),
    0
  );
  const ceiling = Math.max(maxT + 2, 120);

  for (let i = 0; i < patched.length; i++) {
    const ev = patched[i];
    if (!MAKE_PATTERN.test(ev.event)) continue;

    let releaseIdx = -1;
    for (let j = i - 1; j >= 0; j--) {
      if (RELEASE_PATTERN.test(patched[j].event)) {
        releaseIdx = j;
        break;
      }
    }
    if (releaseIdx === -1) continue;

    const release = patched[releaseIdx];
    const gap = ev.t_seconds - release.t_seconds;
    if (gap < MIN_BALL_FLIGHT_SECONDS) {
      const pushed = Math.min(
        ceiling,
        release.t_seconds + PUSHED_GAP_SECONDS
      );
      patched[i] = { ...ev, t_seconds: snap(pushed) };
    }
  }

  return { ...understanding, key_events: patched };
}
