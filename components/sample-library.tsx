"use client";

import { SampleCard } from "@/components/sample-card";
import { SAMPLES } from "@/lib/samples";

export function SampleLibrary({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {SAMPLES.map((sample) => (
        <SampleCard
          key={sample.id}
          sample={sample}
          selected={selectedId === sample.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
