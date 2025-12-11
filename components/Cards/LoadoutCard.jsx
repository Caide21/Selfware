import LoadoutCard from '@/components/Loadouts/LoadoutCard';

export default function LoadoutCardWrapper({ card, loadout, ...rest }) {
  const data = card || loadout || {};
  const linkedItems = data.linkedItems || data.items;
  const linkedCount = Array.isArray(linkedItems) ? linkedItems.length : data.linkedCount;

  return (
    <LoadoutCard
      loadout={{ ...data, linkedCount, isToday: data.isToday || data.is_today }}
      {...rest}
    />
  );
}
