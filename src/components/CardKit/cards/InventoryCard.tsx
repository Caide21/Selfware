import type { ComponentType } from 'react';
import InventoryCardComponentRaw from '@/modules/inventory/InventoryCard';

type Inventory = Record<string, any>;

export interface InventoryCardProps {
  card?: Inventory;
  item?: Inventory;
  [key: string]: any;
}

export default function InventoryCard({ card, item, ...rest }: InventoryCardProps) {
  const data = card || item || {};
  const InventoryCardComponent = InventoryCardComponentRaw as unknown as ComponentType<any>;
  return <InventoryCardComponent {...({ item: data, ...rest } as any)} />;
}
