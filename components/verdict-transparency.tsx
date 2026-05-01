"use client";

import * as React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, Sparkles } from "lucide-react";
import type { CandidateRuleTag, PlayUnderstanding, RuleEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  understanding: PlayUnderstanding;
  selectedRules: RuleEntry[];
};

const CONTACT_LABEL: Record<PlayUnderstanding["observable_contact"], string> = {
  none: "No visible contact",
  incidental: "Incidental contact",
  significant: "Significant contact",
};

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[var(--radius-pill)] border border-border-subtle bg-background px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
      {children}
    </span>
  );
}

export function VerdictTransparency({ understanding, selectedRules }: Props) {
  const candidateRules = understanding.candidate_rules as CandidateRuleTag[];
  const hasCandidates = candidateRules.length > 0;
  const hasSelected = selectedRules.length > 0;

  return (
    <div className="rounded-[var(--radius-card)] border border-border-subtle bg-surface">
      <Accordion.Root type="single" collapsible>
        <Accordion.Item value="transparency">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-3 rounded-[var(--radius-card)] p-5 text-left transition-colors hover:bg-background/30">
              <div className="flex items-center gap-3">
                <Sparkles className="size-4 text-accent" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    Evidence chain
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    How RefCheck arrived at this verdict
                  </p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "size-4 text-muted transition-transform duration-200",
                  "group-data-[state=open]:rotate-180"
                )}
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="border-t border-border-subtle p-5">
              <dl className="grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    Observable contact
                  </dt>
                  <dd className="mt-2 text-sm text-foreground">
                    {CONTACT_LABEL[understanding.observable_contact]}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    Ambiguity flagged
                  </dt>
                  <dd className="mt-2 text-sm text-foreground">
                    {understanding.ambiguity_notes ||
                      "No significant ambiguity."}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    Model-proposed rule tags
                  </dt>
                  <dd className="mt-2">
                    {hasCandidates ? (
                      <div className="flex flex-wrap gap-1.5">
                        {candidateRules.map((t) => (
                          <Tag key={t}>{t.replace(/_/g, " ")}</Tag>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted">
                        (none proposed)
                      </span>
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    Rulebook excerpts sent to model
                  </dt>
                  <dd className="mt-2">
                    {hasSelected ? (
                      <ul className="space-y-1.5">
                        {selectedRules.map((r) => (
                          <li
                            key={r.id}
                            className="flex items-start gap-2 text-sm text-foreground"
                          >
                            <span className="mt-0.5 font-mono text-[10px] text-accent">
                              {r.section}
                            </span>
                            <span className="text-muted">—</span>
                            <span>{r.title}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-sm text-muted">
                        No rules matched — model was asked to return
                        INCONCLUSIVE.
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
              <p className="mt-5 border-t border-border-subtle pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                This is the exact evidence chain that produced the verdict
                above.
              </p>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
}
