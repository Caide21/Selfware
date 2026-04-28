import React, { useEffect, useState } from "react";
import StatCard from "@/components/CardKit/cards/StatCard";
import SectionHeading from "../SectionHeading";

const categoryMetadata = {
  mental: { icon: "🧠", label: "Mental / Cognitive", color: "text-sky-400" },
  physical: { icon: "💪", label: "Physical / Biological", color: "text-orange-400" },
  emotional: { icon: "❤️", label: "Emotional / Psychological", color: "text-red-400" },
  spiritual: { icon: "🧭", label: "Spiritual / Symbolic", color: "text-violet-400" },
  behavioral: { icon: "🕹️", label: "Behavioral / Habitual", color: "text-yellow-400" }
};

export default function StatMap() {
  const [stats, setStats] = useState([]);
  const [openCategories, setOpenCategories] = useState({});

  useEffect(() => {
    fetch("/data/caide_stat_sheet.json")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        const groups = [...new Set(data.map((s) => s.category))];
        const initState = Object.fromEntries(groups.map((c) => [c, true]));
        setOpenCategories(initState);
      })
      .catch((err) => console.error("Failed to load stat data:", err));
  }, []);

  const grouped = stats.reduce((acc, stat) => {
    const key = stat.category || "uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(stat);
    return acc;
  }, {});

  const toggleCategory = (key) =>
    setOpenCategories((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, group]) => {
        const meta = categoryMetadata[category] || { label: category, icon: "🌀", color: "text-gray-400" };
        const open = openCategories[category];

        return (
          <div key={category}>
            <button
              className={`text-xl font-semibold mb-2 flex items-center gap-2 ${meta.color}`}
              onClick={() => toggleCategory(category)}
            >
              <span>{meta.icon}</span>
              {meta.label}
              <span className="text-sm ml-auto text-gray-400">{open ? "Collapse" : "Expand"}</span>
            </button>
            {open && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.map((stat) => (
                  <StatCard key={stat.id} stat={stat} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
