import React from "react";

export default function RegulationPanel({ data = { breath: 6, awareness: 7, reaction: 8 } }) {
  return (
    <div className="bg-black/20 p-4 rounded-xl border space-y-1">
      <div className="text-sm text-gray-400 mb-1">🧘 Regulation</div>
      <div className="text-sm">Breath: {data.breath}</div>
      <div className="text-sm">Awareness: {data.awareness}</div>
      <div className="text-sm">Reaction Control: {data.reaction}</div>
    </div>
  );
}