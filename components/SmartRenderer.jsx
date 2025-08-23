import { ScrollPage, RitualPage, CodexPage, QuestPage } from './Pages'
import { ScrollCard, RitualCard, CodexCard, QuestCard } from './Cards'

export default function SmartRenderer({ page, blocks, mode = 'card' }) {
  const properties = page.properties

  const type = properties.Type?.select?.name || ''

  const props = {
    title: properties.Name?.title[0]?.plain_text || '',
    slug: properties.Slug?.rich_text[0]?.plain_text || '',
    description: properties.Description?.rich_text?.[0]?.plain_text || '',
    symbol: properties.Symbol?.rich_text?.[0]?.plain_text || '',
    essence: properties.Essence?.rich_text?.[0]?.plain_text || '',
    coreLaw: properties.CoreLaw?.rich_text?.[0]?.plain_text || '',
    ritual: properties.Ritual?.rich_text?.[0]?.plain_text || '',
    blocks: blocks || [] // ✅ safe fallback
  }

  if (mode === 'card') {
    if (type === 'Scroll') return <ScrollCard {...props} />
    if (type === 'Ritual') return <RitualCard {...props} />
    if (type === 'Codex') return <CodexCard {...props} />
    if (type === 'Quest') return <QuestCard {...props} />
  }

  if (mode === 'detail') {
    if (type === 'Scroll') return <ScrollPage {...props} />
    if (type === 'Ritual') return <RitualPage {...props} />
    if (type === 'Codex') return <CodexPage {...props} />
    if (type === 'Quest') return <QuestPage {...props} />
  }

  return <div>Unknown Type</div>
}
