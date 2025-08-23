import React, { useEffect, useState } from "react";
import EmotionCard from "../Cards/EmotionCard";

export default function EmotionMap() {
  const [state, setState] = useState(null);

  useEffect(() => {
    fetch("/data/emotionalState.json")
      .then((res) => res.json())
      .then((data) => setState(data))
      .catch((err) => console.error("Failed to load emotional state:", err));
  }, []);

  if (!state) return <div className="text-gray-400">Loading emotional state...</div>;

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-400">
        <strong>Last updated:</strong> {new Date(state.timestamp).toLocaleString()}
      </div>

      <div className="text-lg font-semibold">🌀 Fog Level: {state.fogLevel}/5</div>
      <div className="text-lg font-semibold">
        📊 Load: {state.load} / {state.capacity}
      </div>

      <div className="text-lg font-semibold">🧘 Regulation</div>
      <ul className="text-sm text-gray-300 list-disc ml-5">
        <li>Breath: {state.regulation.breath}</li>
        <li>Awareness: {state.regulation.awareness}</li>
        <li>Reaction Control: {state.regulation.reaction_control}</li>
      </ul>

      <div className="text-lg font-semibold mt-6">❤️ Active Emotions</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.activeEmotions.map((emotion, idx) => (
          <EmotionCard key={idx} emotion={emotion} />
        ))}
      </div>

      <div className="mt-6 text-sm italic text-gray-400 border-t border-gray-700 pt-4">
        {state.notes}
      </div>
    </div>
  );
}