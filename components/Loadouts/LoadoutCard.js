import Card from '@/components/CardKit/Card';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { resolveTags, tagFromSlug } from '@/components/ui/tagRegistry';
import { useCardStyle } from '@/components/Card/useCardStyle';

const TODAY_TAG = tagFromSlug('loadout:today', {
  label: 'Today',
  tone: 'status',
  intent: 'active',
});

export default function LoadoutCard({ loadout, onEquipToday, onDelete, equipping }) {
  const isToday = loadout.isToday || loadout.is_today;
  const baseTags = resolveTags(loadout.tags || []);
  const tags = isToday ? [TODAY_TAG, ...baseTags] : baseTags;
  const { variant } = useCardStyle({ tags, selected: isToday });
  const itemCount = Array.isArray(loadout.items) ? loadout.items.length : 0;

  return (
    <Card
      variant={variant}
      title={loadout.name}
      meta={`Items: ${itemCount}`}
      interactive={false}
      selected={isToday}
      data-today={isToday ? 'true' : 'false'}
    >
      {tags.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag.slug || tag.label} tag={tag} state={isToday ? 'selected' : 'idle'} />
          ))}
        </div>
      ) : null}

      <div className="flex gap-2 text-xs">
        <Link className="px-2 py-1 border rounded" href={`/loadouts/${loadout.id}`}>
          Open
        </Link>
        <button className="px-2 py-1 border rounded" onClick={() => onEquipToday(loadout.id)} disabled={equipping}>
          {equipping ? 'Equipping...' : 'Equip'}
        </button>
        <button className="px-2 py-1 border rounded" onClick={() => onDelete(loadout.id)}>
          Delete
        </button>
      </div>
    </Card>
  );
}
