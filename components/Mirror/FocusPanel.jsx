import React from "react";

export default function FocusPanel({ focus = "Stat Overhaul" }) {
  return (
    <div className="bg-black/20 p-4 rounded-xl border">
      <div className="text-sm text-gray-400 mb-1">🎯 Current Focus</div>
      <div className="text-lg font-semibold">{focus}</div>
    </div>
  );
}