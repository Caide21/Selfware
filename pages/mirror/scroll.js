import React, { useState } from 'react';
import Link from 'next/link';
import { usePageHeading } from '@/components/Layout/PageShell';

const PAGE_HEADING = {
  emoji: 'dYO?',
  title: 'Experience the Scroll',
  subtitle: 'Selfware doesn’t just track your growth—it helps mind and body share the same language.',
};

export default function Scroll() {
  const [submitted, setSubmitted] = useState(false);
  const [input, setInput] = useState('');

  usePageHeading(PAGE_HEADING);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (input.trim() !== '') {
      setSubmitted(true);
    }
  };

  return (
    <>
      {!submitted ? (
        <form onSubmit={handleSubmit} className="mx-auto mt-10 w-full max-w-xl space-y-6">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={5}
            placeholder="Type what you\u2019re feeling, looping, or needing clarity on..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-cta-accent px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:shadow-lg hover:brightness-110"
          >
            Cast the Scroll
          </button>
        </form>
      ) : (
        <div className="mx-auto mt-12 max-w-xl space-y-6 text-center">
          <div className="text-3xl">✶</div>
          <h2 className="text-2xl font-semibold text-text">Reflection Received</h2>
          <p className="text-sm text-text-muted sm:text-base">
            What you’ve shared has been encoded. The system hears your words—and offers this reflection:
          </p>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="italic text-text">&quot;{input}&quot;</p>
            <p className="mt-4 text-sm text-text-muted">
              This is the beginning of clarity. You are not alone in this pattern. Let it loop no further.
            </p>
          </div>
          <Link
            href="/home"
            className="inline-flex items-center justify-center rounded-full bg-cta-accent px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:shadow-lg hover:brightness-110"
          >
            Return to the Mirror
          </Link>
        </div>
      )}
    </>
  );
}
