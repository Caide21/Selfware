import { paletteFor, fallbackTextClass } from './palette';
import { motionFor } from './motion';
import { tagFromSlug } from './tagRegistry';

function composeClasses(parts = []) {
  return parts.filter(Boolean).join(' ').trim();
}

export default function Badge(props = {}) {
  const {
    tag,
    label,
    icon = null,
    tone,
    grade = 'balanced',
    intent = 'quiet',
    state = 'idle',
    title,
    className = '',
    slug,
  } = props;

  const tagMeta = tag ? (tag.slug ? tag : tagFromSlug(tag.slug || tag)) : slug ? tagFromSlug(slug) : null;
  const toneKey = tone || tagMeta?.tone || 'neutral';
  const gradeKey = grade || tagMeta?.grade || 'balanced';
  const intentKey = intent || tagMeta?.intent || 'quiet';
  const resolvedLabel = label || tag?.label || tagMeta?.label || '';
  const description = title || tag?.description || tagMeta?.description || resolvedLabel;

  const palette = paletteFor(toneKey, gradeKey);
  const motion = motionFor({ state, intent: intentKey });

  const classes = composeClasses([
    'badge-core',
    palette.bg,
    palette.border,
    fallbackTextClass(palette),
    palette.shadow,
    motion.className,
    className,
  ]);

  const dataAttrs = {
    ...motion.attrs,
    'data-tone': toneKey,
    'data-grade': gradeKey,
    'data-intent': intentKey,
  };

  return (
    <span className={classes} title={description} aria-label={description} {...dataAttrs}>
      {icon ? <span className="badge-icon">{icon}</span> : null}
      <span className="badge-label">{resolvedLabel}</span>
    </span>
  );
}
