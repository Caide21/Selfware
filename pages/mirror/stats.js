import React from "react";
import PageShell from "@/components/Layout/PageShell";
import StatMap from "@/components/Mirror/StatMap";

export default function StatsPage() {
  return (
    <PageShell
      heading={{
        emoji: "🪞",
        title: "The Mirror: Stat Sheet",
        subtitle: "Track, reflect, and measure your state in real-time."
      }}
    >
      <div className="max-w-5xl mx-auto px-4">
        <StatMap />
      </div>
    </PageShell>
  );
}
