// src/worlds/core/zones.ts

export type ZoneId = 'status' | 'quests' | 'habits' | 'inventory' | 'settings';

export interface ZoneConfig {
  id: ZoneId;
  label: string;
  icon: string;          // could be emoji or icon name
  path: string;          // Next.js route path
  shortDescription?: string;
}

export const ZONES: ZoneConfig[] = [
  {
    id: 'status',
    label: 'Status Panel',
    icon: '📊',
    path: '/status',
    shortDescription: "Today’s state, vitals, and loops.",
  },
  {
    id: 'quests',
    label: 'Quests',
    icon: '🎯',
    path: '/quests',
    shortDescription: 'Main, side, and nested questlines.',
  },
  {
    id: 'habits',
    label: 'Habits',
    icon: '🔁',
    path: '/habits',
    shortDescription: 'Daily/weekly patterns and switches.',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: '🎒',
    path: '/inventory',
    shortDescription: 'Tools, codex, and stored blueprints.',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    path: '/settings',
    shortDescription: 'Preferences, themes, and data controls.',
  },
];

// Fast lookup by id, fully typed.
export const ZONES_BY_ID: Record<ZoneId, ZoneConfig> = ZONES.reduce(
  (acc, zone) => {
    acc[zone.id] = zone;
    return acc;
  },
  {} as Record<ZoneId, ZoneConfig>,
);

// Optional helper: get a zone safely
export function getZoneConfig(id: ZoneId): ZoneConfig {
  return ZONES_BY_ID[id];
}
