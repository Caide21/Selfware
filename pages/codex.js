import Link from 'next/link';
import Head from 'next/head';
import { usePageHeading } from '@/components/Layout/PageShell';
import { fetchCodexIndexFromNotion } from '../lib/notion';
import { syncCodexIndexToSupabase } from '../lib/codexSync';
import { supabase } from '../lib/supabaseClient';

const PAGE_HEADING = {
  emoji: 'dY�',
  title: 'The Codex',
  subtitle: 'Browse symbolic scrolls, operating principles, and reference entries.',
};

const isCodexDebug = process.env.CODEx_DEBUG === '1';
const showSyncButton = process.env.NODE_ENV !== 'production' || isCodexDebug;

export default function CodexPage({ codex, error }) {
  usePageHeading(PAGE_HEADING);

  return (
    <>
      <Head>
        <meta name="theme-color" content="#FFFFFF" />
      </Head>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-2 sm:px-0 lg:grid-cols-3">
        {error ? (
          <p className="col-span-full text-center text-sm text-tertiary">
            Unable to load Codex entries right now.
          </p>
        ) : (
          codex.map(({ title, slug, description, symbol }) => (
            <Link key={slug} href={`/${slug}`} className="rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-semibold text-text">
                {symbol ? `${symbol} ` : ''}
                {title}
              </h2>
              {description ? (
                <p className="mt-3 text-sm text-text-muted">{description}</p>
              ) : (
                <p className="mt-3 text-sm italic text-text-muted">No description yet.</p>
              )}
            </Link>
          ))
        )}
      </div>

      {showSyncButton ? (
        <div className="mx-auto mt-6 max-w-6xl px-2 sm:px-0">
          <button
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-text transition hover:border-primary/50 hover:text-primary"
            onClick={async () => {
              try {
                const response = await fetch('/api/codex/sync', { method: 'POST' });
                const summary = await response.json();
                if (isCodexDebug) console.log('Codex sync:', summary);
                if (summary.ok) {
                  window.location.reload();
                }
              } catch (err) {
                if (isCodexDebug) console.error('Codex sync error', err);
              }
            }}
          >
            Sync Codex
          </button>
        </div>
      ) : null}
    </>
  );
}

export async function getServerSideProps() {
  const debug = process.env.CODEx_DEBUG === '1';

  try {
    const notionEntries = await fetchCodexIndexFromNotion();
    await syncCodexIndexToSupabase({ entries: notionEntries, userId: null });

    const { data, error } = await supabase
      .from('codex_entries')
      .select('title, slug, symbol, description')
      .is('user_id', null)
      .order('title', { ascending: true });

    if (error) throw error;

    return { props: { codex: data || [] } };
  } catch (err) {
    if (debug) console.error('[Codex SSR] Error:', err);
    return { props: { codex: [], error: true } };
  }
}
