import React from "react";

export default function EmotionSummary({ emotions = [] }) {
  return (
    <div className="bg-black/20 p-4 rounded-xl border">
      <div className="text-sm text-gray-400 mb-1">🫀 Emotions</div>
      {emotions.length > 0 ? (
        <ul className="text-sm text-gray-300 list-disc ml-5">
          {emotions.map((e, idx) => (
            <li key={idx}>{e.symbol} {e.name} ({e.intensity}) – {e.source}</li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-500">Emotionally stable.</div>
      )}
    </div>
  );
}