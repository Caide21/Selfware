import React from "react";
import PageShell from "@/components/Layout/PageShell";
import RitualMap from "@/components/Mirror/RitualMap";

export default function SpellbookPage() {
  return (
    <PageShell
      heading={{
        emoji: "📖",
        title: "The Spellbook",
        subtitle: "Rituals, blueprints, and personal spells encoded in symbolic grammar."
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <RitualMap />
      </div>
    </PageShell>
  );
}
