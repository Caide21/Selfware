import Badge from '@/components/ui/Badge';
import { resolveTags, tagFromSlug } from '@/components/ui/tagRegistry';
import { useCardStyle } from '@/components/Card/useCardStyle';

const STATUS_TAGS = {
  equipped: tagFromSlug('mind:equipped', {
    label: 'Equipped',
    tone: 'status',
    intent: 'active',
  }),
  practicing: tagFromSlug('mind:practicing', {
    label: 'Practicing',
    tone: 'skill',
    intent: 'active',
  }),
  ready: tagFromSlug('mind:ready', {
    label: 'Ready',
    tone: 'info',
  }),
  draft: tagFromSlug('mind:draft', {
    label: 'Draft',
    tone: 'neutral',
  }),
  archived: tagFromSlug('mind:archive', {
    label: 'Archived',
    tone: 'constraint',
  }),
};

export default function EntryCard({ title, summary, status, tags }) {
  const statusTag = status ? STATUS_TAGS[status] : null;
  const tagList = resolveTags(tags);
  const cardTags = statusTag ? [statusTag, ...tagList] : tagList;
  const { cardClass, titleClass } = useCardStyle({ tags: cardTags });
  return (
    <div className={`${cardClass} bg-white/5 p-4 card-hover`}>
      <div className="flex items-start justify-between gap-4">
        <h3 className={`text-lg ${titleClass}`}>{title}</h3>
        {statusTag ? <Badge tag={statusTag} state={status === 'equipped' ? 'selected' : 'idle'} /> : null}
      </div>

      <p className="mt-2 text-sm text-white/70 leading-relaxed">{summary}</p>

      {!!tagList.length && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tagList.map((tag) => (
            <Badge key={tag.slug || tag.label} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
