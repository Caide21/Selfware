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
  const { cardClass, titleClass, tone, grade, accentStyle } = useCardStyle({
    card: safeCard,
    tags,
    selected,
    play,
    variant: 'prism',
  });

  if (!card) return null;

  return (
    <article
      className={[
        cardClass,
        'p-5 space-y-3',
        interactive ? 'cursor-pointer' : 'cursor-default',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      data-selected={selected ? 'true' : 'false'}
      data-card-grade={grade}
      data-card-tone={tone}
      style={accentStyle}
    >
      <header className="flex items-start justify-between gap-2">
        <h3 className={`text-base ${titleClass}`}>{card.title || 'Untitled Card'}</h3>
        <span className="text-xs font-semibold" data-card-kind>
          {card.kind || 'generic'}
        </span>
      </header>

      {!!tags.length && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag.slug || tag.label} tag={tag} state={selected ? 'selected' : 'idle'} />
          ))}
        </div>
      )}

      <div className="space-y-2">
        {attachments.map((attachment) => (
          <AttachmentRenderer key={attachment.id} attachment={attachment} />
        ))}
      </div>
    </article>
  );
}
