"use client";

import { BASKETBALL_CALL_LABELS, type BasketballCall } from "@/lib/types";

const CALL_ORDER: (BasketballCall | "")[] = [
  "",
  "blocking_foul",
  "charge",
  "shooting_foul",
  "offensive_foul",
  "traveling",
  "goaltending",
  "out_of_bounds",
  "no_call",
];

export function CallInput({
  call,
  freetext,
  onCallChange,
  onFreetextChange,
  disabled,
}: {
  call: BasketballCall | null;
  freetext: string;
  onCallChange: (c: BasketballCall | null) => void;
  onFreetextChange: (s: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          Original referee call
        </span>
        <select
          value={call ?? ""}
          disabled={disabled}
          onChange={(e) =>
            onCallChange(
              e.target.value === "" ? null : (e.target.value as BasketballCall)
            )
          }
          className="h-11 rounded-lg border border-border-subtle bg-surface px-3 text-sm text-foreground outline-none transition-colors hover:border-border-strong focus:border-accent disabled:opacity-40"
        >
          {CALL_ORDER.map((value) => (
            <option key={value || "blank"} value={value}>
              {value === ""
                ? "Not sure / leave blank"
                : BASKETBALL_CALL_LABELS[value as BasketballCall]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          Optional note
        </span>
        <input
          type="text"
          value={freetext}
          maxLength={240}
          disabled={disabled}
          onChange={(e) => onFreetextChange(e.target.value)}
          placeholder="Anything we should know? e.g. the ref was on the baseline"
          className="h-11 rounded-lg border border-border-subtle bg-surface px-3 text-sm text-foreground placeholder:text-muted/70 outline-none transition-colors hover:border-border-strong focus:border-accent disabled:opacity-40"
        />
      </label>
    </div>
  );
}
