import InventoryCard from '@/modules/inventory/InventoryCard';

export default function InventoryCardWrapper({ card, item, ...rest }) {
  const data = card || item || {};
  return <InventoryCard item={data} {...rest} />;
}
