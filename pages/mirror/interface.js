import React from "react";
import PageShell from "@/components/Layout/PageShell";
import Link from "next/link";

import FocusPanel from "@/components/Mirror/FocusPanel";
import RegulationPanel from "@/components/Mirror/RegulationPanel";
import RecentLogPanel from "@/components/Mirror/RecentLogPanel";
import EmotionSummary from "@/components/Mirror/EmotionSummary";
import FeaturedScrollPanel from "@/components/Mirror/FeaturedScrollPanel";

export default function InterfacePage() {
  const nav = [
    { label: "📊 Stats", path: "/mirror/stats" },
    { label: "🌪 Emotion", path: "/mirror/emotion" },
    { label: "🌳 Tree", path: "/mirror/tree" },
    { label: "📖 Spellbook", path: "/mirror/spellbook" }
  ];

  const xpPercent = 73;

  const recentLogs = [
    "Completed emotional state tracker",
    "Uploaded current skill tree",
    "Integrated stat tracker interface"
  ];

  const emotions = [
    { symbol: "💥", name: "Frustration", intensity: 6, source: "UI loops" },
    { symbol: "🔥", name: "Drive", intensity: 8, source: "Dev sync" }
  ];

  return (
    <PageShell
      heading={{
        emoji: "🧬",
        title: "Human OS Interface",
        subtitle: "A personalized dashboard for cognitive reflection and emotional navigation."
      }}
    >
      <div className="p-4 max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {nav.map(({ label, path }) => (
            <Link key={path} href={path}>
              <div className="bg-black/30 border p-4 rounded-xl text-center font-semibold hover:shadow-md hover:bg-black/40 transition">
                {label}
              </div>
            </Link>
          ))}
        </div>

        <div>
          <div className="text-sm text-gray-300 mb-1 mt-4">🔁 XP Progress</div>
          <div className="w-full bg-gray-800 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full"
              style={{ width: xpPercent + "%" }}
            />
          </div>
          <div className="text-xs text-right text-gray-400 mt-1">{xpPercent}%</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FocusPanel focus="Stat Tracker Polishing" />
          <RegulationPanel />
          <EmotionSummary emotions={emotions} />
          <RecentLogPanel logs={recentLogs} />
        </div>

        <div className="pt-2">
          <FeaturedScrollPanel title="📜 Scroll of Emotional Clarity" />
        </div>
      </div>
    </PageShell>
  );
}
