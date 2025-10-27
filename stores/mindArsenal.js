import { create } from "zustand";

export const mindArsenalSections = [
  {
    id: "core",
    label: "Core Abilities",
    icon: "\u2699",
    description: "Foundational habits, rituals, and operating modes that keep you grounded."
  },
  {
    id: "special",
    label: "Special Abilities",
    icon: "\u26A1",
    description: "Situational powers that help you enter flow, solve problems, or spark creativity."
  },
  {
    id: "codex",
    label: "Codex",
    icon: "\uD83D\uDCDC",
    description: "Distilled notes, wisdom, and references you can quickly consult."
  },
  {
    id: "blueprints",
    label: "Blueprints",
    icon: "\uD83D\uDD27",
    description: "Systems, frameworks, and strategies ready to deploy."
  },
  {
    id: "archive",
    label: "Archive",
    icon: "\uD83D\uDDC3",
    description: "Past experiments, retired tactics, and historical context."
  }
];

const starterEntries = {
  core: [
    {
      id: "core-morning-scan",
      title: "Morning Systems Scan",
      summary: "Three-minute check-in to align body, mind, and priorities before the day starts.",
      status: "equipped",
      tags: ["daily", "ritual"]
    },
    {
      id: "core-evening-reset",
      title: "Evening Reset",
      summary: "Wind down ritual that logs learnings and releases the day.",
      status: "practicing",
      tags: ["reflection"]
    }
  ],
  special: [
    {
      id: "special-flow-trigger",
      title: "Flow Trigger Sequence",
      summary: "Music cue + breath stack that helps you enter deep focus in 90 seconds.",
      status: "equipped",
      tags: ["focus", "audio"]
    }
  ],
  codex: [
    {
      id: "codex-dopamine-loop",
      title: "Dopamine Loop Primer",
      summary: "Notes on managing dopamine cycles to avoid burnout and maximize intrigue.",
      status: "draft",
      tags: ["neuro", "reference"]
    }
  ],
  blueprints: [
    {
      id: "blueprint-sprint",
      title: "Learning Sprint Blueprint",
      summary: "Two-week iteration pattern to level up a skill with feedback loops.",
      status: "ready",
      tags: ["system", "learning"]
    }
  ],
  archive: [
    {
      id: "archive-2024",
      title: "2024 Strategy Retrospective",
      summary: "What worked, what didn't, and the upgrades planned for the next cycle.",
      status: "archived",
      tags: ["history"]
    }
  ]
};

export const useMindArsenalStore = create((set, get) => ({
  sections: mindArsenalSections,
  entries: starterEntries,

  setSectionEntries(sectionId, items) {
    set((state) => ({
      entries: { ...state.entries, [sectionId]: items }
    }));
  },

  addEntry(sectionId, entry) {
    const existing = get().entries[sectionId] ?? [];
    set({
      entries: {
        ...get().entries,
        [sectionId]: [...existing, entry]
      }
    });
  }
}));
