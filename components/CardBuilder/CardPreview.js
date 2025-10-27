import Badge from '@/components/ui/Badge';
import { paletteFor } from '@/components/ui/palette';

export function CardPreview({ card, attachments = [], play }) {
  const tone = card?.state?.tone || 'neutral';
  const palette = paletteFor(tone, play ? 'balanced' : 'subtle');

  return (
    <article className={`rounded-2xl border ${palette.bg} ${palette.border} p-4 space-y-3`}>
      <header className="flex items-start justify-between gap-2">
        <h3 className="text-base text-white font-semibold">{card?.title || 'Untitled Card'}</h3>
        <span className="text-xs text-white/50">{card?.kind || 'generic'}</span>
      </header>
      <div className="space-y-2 text-sm text-white/80">
        {attachments.map((attachment) => (
          <p key={attachment.id}>{attachment.payload?.content}</p>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {(card?.state?.tags || []).map((tag) => (
          <Badge key={tag.slug || tag.label} tag={tag} />
        ))}
      </div>
    </article>
  );
}
