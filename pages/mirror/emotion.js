import React from "react";
import PageShell from "@/components/Layout/PageShell";
import EmotionMap from "@/components/Mirror/EmotionMap";

export default function EmotionPage() {
  return (
    <PageShell
      heading={{
        emoji: "🫀",
        title: "Emotional State Tracker",
        subtitle: "A mirror for your inner weather. Observe, don’t judge."
      }}
    >
      <div className="max-w-4xl mx-auto px-4">
        <EmotionMap />
      </div>
    </PageShell>
  );
}
