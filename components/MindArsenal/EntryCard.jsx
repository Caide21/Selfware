import Card from '@/components/CardKit/Card';
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
  const { variant } = useCardStyle({ tags: cardTags });

  return (
    <Card
      title={title}
      variant={variant}
      interactive={false}
      meta={statusTag ? statusTag.label : undefined}
    >
      {summary ? <p className="text-sm text-text/80 leading-relaxed">{summary}</p> : null}
      {!!tagList.length && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tagList.map((tag) => (
            <Badge key={tag.slug || tag.label} tag={tag} />
          ))}
        </div>
      )}
    </Card>
  );
}


