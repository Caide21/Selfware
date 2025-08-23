import React from "react";
import PageShell from "@/components/Layout/PageShell";
import SkillMap from "@/components/Mirror/SkillMap";

export default function SkillTreePage() {
  return (
    <PageShell
      heading={{
        emoji: "🌳",
        title: "Skill Tree",
        subtitle: "Evolving abilities, visualized and nurtured. Watch your patterns grow."
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <SkillMap />
      </div>
    </PageShell>
  );
}
