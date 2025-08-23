import React from "react";

export default function FeaturedScrollPanel({ title = "Scroll of Symbolic Transmission" }) {
  return (
    <div className="bg-black/20 p-4 rounded-xl border">
      <div className="text-sm text-gray-400 mb-1">📚 Featured Scroll</div>
      <div className="text-sm font-semibold">{title}</div>
    </div>
  );
}