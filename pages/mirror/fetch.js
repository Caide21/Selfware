import { useState } from 'react';
import { TextInput } from '@/components/Form';
import SmartRenderer from '@/components/SmartRenderer.jsx';

export default function CodexPage() {
  const [title, setTitle] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSearch() {
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/fetch-codex?title=${encodeURIComponent(title)}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const normalized = {
        ...data,
        type: data.type === 'Lexicon' ? 'Codex' : data.type,
      };

      setResult(normalized);
    } catch (err) {
      setError(`Page "${title}" not found`);
    }
  }

  const page = result || null;

  return (
    <main className="relative min-h-screen px-4 pb-16 pt-24 text-text">
      <div className="absolute right-10 top-16 z-50 w-80 space-y-2">
        <TextInput
          placeholder="Search a Codex or Scroll..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="w-full rounded-full bg-cta-accent px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:brightness-110"
        >
          Fetch Page
        </button>
        {error ? <p className="text-sm text-tertiary">{error}</p> : null}
      </div>

      <div className="flex items-center justify-center pt-32">
        {page ? (
          <div className="w-full max-w-2xl">
            <SmartRenderer
              title={page.title}
              updated={page.updated}
              content={page.description}
              type={page.type}
            />
          </div>
        ) : (
          <div className="mx-auto max-w-lg text-center text-sm text-text-muted">
            What would you like to remember?
            <br />
            Type the name of a Scroll or Codex to summon it from your library.
          </div>
        )}
      </div>
    </main>
  );
}

export async function getServerSideProps() {
  return { props: { defaultPage: null } };
}
