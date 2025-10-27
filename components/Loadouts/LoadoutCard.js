import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { resolveTags, tagFromSlug } from '@/components/ui/tagRegistry';
import { useCardStyle } from '@/components/Card/useCardStyle';

const TODAY_TAG = tagFromSlug('loadout:today', {
  label: 'Today',
  tone: 'status',
  intent: 'active',
  grade: 'balanced',
});

export default function LoadoutCard({ loadout, onEquipToday, onDelete, equipping }) {
  const isToday = loadout.isToday || loadout.is_today;
  const baseTags = resolveTags(loadout.tags || []);
  const tags = isToday ? [TODAY_TAG, ...baseTags] : baseTags;
  const { cardClass, titleClass } = useCardStyle({ tags, selected: isToday });
  const itemCount = Array.isArray(loadout.items) ? loadout.items.length : 0;

  return (
    <div className={`${cardClass} p-3 space-y-2`} data-today={isToday ? 'true' : 'false'}>
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 ${titleClass}`}>
          <span>{loadout.name}</span>
          {isToday ? <Badge tag={TODAY_TAG} state="selected" /> : null}
        </div>
        <div className="text-xs opacity-70">items: {itemCount}</div>
      </div>

      {!!tags.length && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag.slug || tag.label} tag={tag} />
          ))}
        </div>
      )}

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
    </div>
  );
}
