import Card from '@/components/CardKit/Card';
import Badge from '@/components/ui/Badge';
import { resolveTags } from '@/components/ui/tagRegistry';
import { useCardStyle } from '@/components/Card/useCardStyle';
import AttachmentRenderer from './AttachmentRenderer';

export default function CardView({
  card,
  attachments = [],
  selected = false,
  play = false,
  onClick,
  interactive = true,
  className = '',
}) {
  const safeCard = card ?? { state: {} };
  const tags = resolveTags(safeCard.state?.tags || []);
  const { variant, tone, grade } = useCardStyle({
    card: safeCard,
    tags,
    selected,
    play,
  });

  if (!card) return null;

  return (
    <Card
      title={card.title || 'Untitled Card'}
      meta={card.kind || 'generic'}
      variant={variant}
      selected={selected}
      interactive={interactive}
      onClick={interactive ? onClick : undefined}
      className={className}
      data-selected={selected ? 'true' : 'false'}
      data-card-grade={grade}
      data-card-tone={tone}
    >
      {tags.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag.slug || tag.label} tag={tag} state={selected ? 'selected' : 'idle'} />
          ))}
        </div>
      ) : null}

      <div className="space-y-2">
        {attachments.map((attachment) => (
          <AttachmentRenderer key={attachment.id} attachment={attachment} />
        ))}
      </div>
    </Card>
  );
}
