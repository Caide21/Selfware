import { useEffect, useMemo, useState } from 'react';
import Badge from '@/components/ui/Badge';
import { resolveTags, tagFromSlug } from '@/components/ui/tagRegistry';
import AttachmentEditor from './AttachmentEditor';

export default function CardEditor({
  card,
  attachments = [],
  onUpdate,
  onUpdateTags,
  onUpdateAttachment, onAddAttachment,
}) {
  const [localTitle, setLocalTitle] = useState(card?.title || '');
  const [tagInput, setTagInput] = useState('');
  const tags = useMemo(() => resolveTags(card?.state?.tags || []), [card]);

  useEffect(() => {
    setLocalTitle(card?.title || '');
  }, [card?.id, card?.title]);

  if (!card) return null;

  const handleTitleBlur = () => {
    if (localTitle !== card.title) {
      onUpdate?.({ title: localTitle });
    }
  };

  const handleAddTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    const slug = value.includes(':') ? value : `custom:${value.toLowerCase().replace(/\s+/g, '-')}`;
    const nextTags = [...tags, tagFromSlug(slug, { label: value })];
    onUpdateTags?.(nextTags);
    setTagInput('');
  };

  const handleRemoveTag = (slug) => {
    const nextTags = tags.filter((tag) => tag.slug !== slug);
    onUpdateTags?.(nextTags);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs uppercase tracking-wide text-white/60 block mb-1">Title</label>
        <input
          className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          value={localTitle}
          onChange={(event) => setLocalTitle(event.target.value)}
          onBlur={handleTitleBlur}
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-white/60 block mb-1">Kind</label>
        <input
          className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          defaultValue={card.kind || ''}
          onBlur={(event) => onUpdate?.({ kind: event.target.value })}
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-white/60 block mb-1">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <button
              key={tag.slug || tag.label}
              type="button"
              className="relative group"
              onClick={() => handleRemoveTag(tag.slug)}
              title="Remove tag"
            >
              <Badge tag={tag} state="selected" />
              <span className="absolute -top-1 -right-1 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                Ã—
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Add tag slug or label"
          />
          <button
            type="button"
            className="px-3 py-2 rounded-lg border border-white/10 bg-white/10 text-sm hover:bg-white/20 transition"
            onClick={handleAddTag}
          >
            Add
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs uppercase tracking-wide text-white/60">Attachments</h4>
          <button
            type="button"
            className="px-2 py-1 text-xs rounded-lg border border-white/10 bg-white/10 hover:bg-white/20 transition"
            onClick={() =>
              onAddAttachment?.({ card_id: card.id, type: 'text', payload: { content: '' } })
            }
          >
            + Text Block
          </button>
        </div>
        {attachments.map((attachment) => (
          <AttachmentEditor
            key={attachment.id}
            attachment={attachment}
            onChange={(next) => onUpdateAttachment?.(attachment, next)}
          />
        ))}
      </div>
    </div>
  );
}

