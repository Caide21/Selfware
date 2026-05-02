import Head from 'next/head';
import { useState } from 'react';
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

export default function AdminMembersPage() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  usePageHeading(PAGE_HEADING);

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
      </section>
    </>
  );
}
