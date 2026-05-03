import Head from 'next/head';
import { useEffect, useState } from 'react';
import { usePageHeading } from '@/components/Layout/PageShell';
import { supabase } from '@/lib/supabaseClient';

const PAGE_HEADING = {
  emoji: '',
  title: 'Admin / Member Lookup',
  subtitle: 'Search users by name or email, then copy their user ID into Move-Out HQ.',
};

function formatDate(value) {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function statusLabel(status, count = 0) {
  if (status === 'ok') return 'Clean';
  if (status === 'found') return count > 0 ? 'Found' : 'Clean';
  if (status === 'skipped') return 'Skipped';
  if (status === 'error') return 'Error';
  return 'Unknown';
}

function statusClassName(status) {
  if (status === 'ok') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (status === 'found') return 'border-amber-200 bg-amber-50 text-amber-800';
  if (status === 'skipped') return 'border-slate-200 bg-slate-50 text-slate-600';
  if (status === 'error') return 'border-rose-200 bg-rose-50 text-rose-700';
  return 'border-slate-200 bg-slate-50 text-slate-600';
}

export default function AdminMembersPage() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [showTaskerTokenHelper, setShowTaskerTokenHelper] = useState(false);
  const [tokenCopyMessage, setTokenCopyMessage] = useState(null);

  usePageHeading(PAGE_HEADING);

  useEffect(() => {
    let cancelled = false;

    const checkAdminAccess = async () => {
      setShowTaskerTokenHelper(false);

      try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        if (!token) return;

        const response = await fetch('/api/admin/access', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!cancelled) {
          setShowTaskerTokenHelper(response.ok);
        }
      } catch {
        if (!cancelled) setShowTaskerTokenHelper(false);
      }
    };

    checkAdminAccess();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setError('Enter at least 2 characters.');
      setUsers([]);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    setHasSearched(true);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      const response = await fetch(`/api/admin/search-users?q=${encodeURIComponent(trimmed)}`, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) throw new Error('Please sign in.');
        if (response.status === 403) throw new Error('You do not have admin access.');
        if (response.status === 500 && payload?.error) throw new Error(payload.error);
        throw new Error(payload?.error || 'Search failed.');
      }

      setUsers(Array.isArray(payload?.users) ? payload.users : []);
    } catch (searchError) {
      setUsers([]);
      setError(searchError?.message || 'Could not search users.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (userId) => {
    try {
      await navigator.clipboard.writeText(userId);
      setMessage('User ID copied.');
    } catch {
      setMessage('Could not copy user ID. Copy manually.');
    }
  };

  const handleRunScan = async () => {
    setScanLoading(true);
    setScanError(null);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      const response = await fetch('/api/admin/db-patterns', {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) throw new Error('Please sign in.');
        if (response.status === 403) throw new Error('You do not have admin access.');
        throw new Error(payload?.error || 'Scan failed.');
      }

      setScanResult(payload);
    } catch (scanFailure) {
      setScanResult(null);
      setScanError(scanFailure?.message || 'Could not run database pattern scan.');
    } finally {
      setScanLoading(false);
    }
  };

  const handleCopyTaskerToken = async () => {
    setTokenCopyMessage(null);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      if (!token) {
        setTokenCopyMessage('No active Supabase session found. Sign in again, then retry.');
        return;
      }

      await navigator.clipboard.writeText(token);
      setTokenCopyMessage('Supabase access token copied. Paste it into Tasker as a Bearer token.');
    } catch {
      setTokenCopyMessage('Could not copy token. Browser clipboard access may be blocked.');
    }
  };

  return (
    <>
      <Head>
        <title>Admin / Member Lookup</title>
      </Head>

      <section className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm">
          <h1 className="text-xl font-semibold text-text">Admin / Member Lookup</h1>
          <p className="mt-1 text-sm text-text/65">
            Search users by name or email, then copy their user ID into Move-Out HQ.
          </p>

          <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name or email"
              className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-text placeholder:text-text/45 focus:border-cyan-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {!loading && !error && hasSearched && users.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white/60 px-4 py-5 text-sm text-text/65">
            No matching users yet.
          </div>
        ) : null}

        {users.length ? (
          <div className="space-y-3">
            {users.map((user) => (
              <article key={user.id} className="rounded-lg border border-slate-200 bg-white/70 px-4 py-3 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-text">{user.displayName || 'No display name'}</div>
                    <div className="text-xs text-text/60">{user.email || 'No email'}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(user.id)}
                    className="rounded-md border border-cyan-200 bg-white px-3 py-1.5 text-xs font-semibold text-cyan-800"
                  >
                    Copy ID
                  </button>
                </div>
                <div className="mt-2 text-xs text-text/70">User ID: {user.id}</div>
                <div className="mt-1 text-xs text-text/55">Created: {formatDate(user.createdAt)}</div>
              </article>
            ))}
          </div>
        ) : null}

        {showTaskerTokenHelper ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-amber-950">Temporary Tasker Token Helper</h2>
                <p className="mt-1 text-sm leading-relaxed text-amber-900/80">
                  Copies your current Supabase session access token for Tasker setup. This is temporary,
                  sensitive, and should be removed after Tasker is configured.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyTaskerToken}
                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow"
              >
                Copy Supabase Access Token
              </button>
            </div>

            {tokenCopyMessage ? (
              <div className="mt-3 rounded-md border border-amber-300 bg-white/70 px-3 py-2 text-sm text-amber-950">
                {tokenCopyMessage}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text">Database Pattern Scanner</h2>
              <p className="mt-1 text-sm text-text/65">
                Scan notes and optional admin tables for reused patterns, duplicate commands, and open clock events.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRunScan}
              disabled={scanLoading}
              className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
            >
              {scanLoading ? 'Scanning...' : 'Run Scan'}
            </button>
          </div>

          {scanError ? (
            <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {scanError}
            </div>
          ) : null}

          {scanResult?.generatedAt ? (
            <div className="mt-4 text-xs text-text/55">
              Generated: {formatDate(scanResult.generatedAt)}
            </div>
          ) : null}

          {Array.isArray(scanResult?.checks) && scanResult.checks.length ? (
            <div className="mt-4 grid gap-3">
              {scanResult.checks.map((check) => (
                <article key={check.key} className="rounded-lg border border-slate-200 bg-white/75 px-4 py-3 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-text">{check.label}</h3>
                      {check.reason ? (
                        <p className="mt-1 text-xs leading-relaxed text-text/60">{check.reason}</p>
                      ) : null}
                    </div>
                    <span
                      className={[
                        'rounded-full border px-2.5 py-1 text-xs font-semibold',
                        statusClassName(check.status),
                      ].join(' ')}
                    >
                      {statusLabel(check.status, check.count)}
                      {check.status === 'found' ? ` (${check.count})` : ''}
                    </span>
                  </div>

                  {Array.isArray(check.items) && check.items.length ? (
                    <div className="mt-3 space-y-2">
                      {check.items.map((item, index) => (
                        <div key={`${check.key}-${item.pattern || index}`} className="rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-xs font-semibold text-text">{item.preview || item.pattern || 'Pattern'}</div>
                            <div className="text-xs text-text/60">Count: {item.count}</div>
                          </div>
                          {item.pattern && item.pattern !== item.preview ? (
                            <div className="mt-1 break-words text-xs text-text/55">Pattern: {item.pattern}</div>
                          ) : null}
                          <div className="mt-1 break-words text-xs text-text/50">
                            IDs: {(item.ids || []).join(', ') || 'None'}
                          </div>
                          {item.latestSeenAt ? (
                            <div className="mt-1 text-xs text-text/45">Latest: {formatDate(item.latestSeenAt)}</div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : check.status === 'ok' ? (
                    <p className="mt-3 text-xs text-text/55">No duplicated signal found. The board is clean.</p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
