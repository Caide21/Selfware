import React, { useEffect, useState } from "react";
import SkillCard from "../Cards/SkillCard";

export default function SkillMap() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetch("/data/skillTree.json")
      .then((res) => res.json())
      .then((data) => setSkills(data))
      .catch((err) => console.error("Failed to load skill tree:", err));
  }, []);

  const grouped = skills.reduce((acc, skill) => {
    const key = skill.category || "Uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(skill);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([category, group]) => (
        <div key={category}>
          <h2 className="text-2xl font-semibold mb-3">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {group.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}