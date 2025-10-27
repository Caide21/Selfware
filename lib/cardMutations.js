export function normaliseTags(input) {
  if (!Array.isArray(input)) return [];
  return input
    .map((tag) => {
      if (!tag) return null;
      if (typeof tag === 'string') return { slug: tag };
      const slug = tag.slug || tag.identifier || null;
      if (!slug) return null;
      return {
        slug,
        namespace: tag.namespace || (slug.includes(':') ? slug.split(':')[0] : null),
        label: tag.label || null,
      };
    })
    .filter(Boolean);
}

export function diffTags(before = [], after = []) {
  const prev = normaliseTags(before);
  const next = normaliseTags(after);

  const prevSet = new Map(prev.map((tag) => [tag.slug, tag]));
  const nextSet = new Map(next.map((tag) => [tag.slug, tag]));

  const removed = prev.filter((tag) => !nextSet.has(tag.slug));
  const added = next.filter((tag) => !prevSet.has(tag.slug));

  if (!removed.length && !added.length) return null;

  return { tags: { added, removed } };
}

export async function recordMutation(client, { userId, cardId, op, diff = {} }) {
  return client
    .from('mutations')
    .insert({
      user_id: userId,
      card_id: cardId,
      op,
      diff,
    });
}
