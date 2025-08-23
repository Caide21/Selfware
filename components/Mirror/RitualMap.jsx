import React, { useEffect, useState } from "react";
import RitualCard from "../Cards/RitualCard";

export default function RitualMap() {
  const [rituals, setRituals] = useState([]);

  useEffect(() => {
    fetch("/data/rituals.json")
      .then((res) => res.json())
      .then((data) => setRituals(data))
      .catch((err) => console.error("Failed to load rituals:", err));
  }, []);

  const grouped = rituals.reduce((acc, ritual) => {
    const key = ritual.category || "Uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(ritual);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([category, group]) => (
        <div key={category}>
          <h2 className="text-2xl font-semibold mb-3">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {group.map((ritual) => (
              <RitualCard key={ritual.id} ritual={ritual} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}