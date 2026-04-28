import type { ComponentType } from 'react';
import LoadoutCardComponentRaw from '@/components/Loadouts/LoadoutCard';

type Loadout = Record<string, any>;

export interface LoadoutCardProps {
  card?: Loadout;
  loadout?: Loadout;
  [key: string]: any;
}

export default function LoadoutCard({ card, loadout, ...rest }: LoadoutCardProps) {
  const data = card || loadout || {};
  const linkedItems = data.linkedItems || data.items;
  const linkedCount = Array.isArray(linkedItems) ? linkedItems.length : data.linkedCount;

  const LoadoutCardComponent = LoadoutCardComponentRaw as unknown as ComponentType<any>;
  return (
    <LoadoutCardComponent {...({ loadout: { ...data, linkedCount, isToday: data.isToday || data.is_today }, ...rest } as any)} />
  );
}
