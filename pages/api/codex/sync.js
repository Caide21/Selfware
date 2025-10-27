import { fetchCodexIndexFromNotion } from '../../../lib/notion';
import { syncCodexIndexToSupabase } from '../../../lib/codexSync';

const isDebug = process.env.CODEx_DEBUG === '1';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const entries = await fetchCodexIndexFromNotion();
    const result = await syncCodexIndexToSupabase({ entries, userId: null });
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    if (isDebug) console.error('[Codex API Sync] Error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
