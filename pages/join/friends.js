import { useState } from 'react';
import Link from 'next/link';

const PASSWORD = 'FatShits';

export default function FriendsPage() {
  const [access, setAccess] = useState(false);
  const [input, setInput] = useState('');

  if (!access) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-text">
        <h1 className="text-2xl font-semibold">Enter Password to Unlock</h1>
        <input
          type="password"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Secret password..."
          className="w-full max-w-xs rounded border border-slate-300 bg-white px-4 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          onClick={() => setAccess(input === PASSWORD)}
          className="rounded-full bg-cta-accent px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:brightness-110"
        >
          Unlock
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 text-text">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-semibold">Friends Hub</h1>
        <p className="text-base text-text-muted">
          Private drops, work-in-progress scrolls, and feedback loops—shared only with close collaborators.
        </p>
        <div className="grid w-full gap-6 sm:grid-cols-3">
          <Card title="Drugs" href="/friends/drugs" description="Deep dives, protocols, and stack logs." />
          <Card title="Private Scrolls" href="/friends/scrolls" description="Thoughts, rituals, and upgrades in progress." />
          <Card title="Feedback" href="/friends/feedback" description="Leave notes, tweaks, or requests for future drops." />
        </div>
      </div>
    </div>
  );
}

function Card({ title, description, href }) {
  return (
    <Link href={href} className="block rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      <p className="mt-2 text-sm text-text-muted">{description}</p>
    </Link>
  );
}
