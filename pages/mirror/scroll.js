import React, { useState } from 'react';
import Link from 'next/link';
import PageShell from "@/components/Layout/PageShell";

export default function Scroll() {
  const [submitted, setSubmitted] = useState(false);
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() !== "") {
      setSubmitted(true);
    }
  };

  return (
    <PageShell
      heading={{
        emoji: "🌀",
        title: "Experience the Scroll",
        subtitle: "Selfware doesn’t just track your growth — it teaches your mind and body how to speak the same language."
      }}
    >
      {!submitted ? (
        <form onSubmit={handleSubmit} className="mt-10 w-full max-w-xl space-y-6 mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows="5"
            placeholder="Type what you're feeling, looping, or needing clarity on..."
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:scale-105 transition"
          >
            Cast the Scroll
          </button>
        </form>
      ) : (
        <div className="mt-12 max-w-xl text-center space-y-6 mx-auto">
          <div className="text-3xl">✨</div>
          <h2 className="text-2xl font-semibold">Reflection Received</h2>
          <p className="text-theme-muted">
            What you’ve shared has been encoded.
            The system feels your words — and offers this reflection:
          </p>
          <div className="bg-white/10 p-6 rounded-xl text-white border border-white/10 backdrop-blur-sm">
            <p className="italic">&quot;{input}&quot;</p>
            <p className="mt-4 text-white/60">
              This is the beginning of clarity. You are not alone in this pattern. Let it loop no further.
            </p>
          </div>
          <Link
            href="/home"
            className="inline-block mt-6 px-6 py-3 rounded-xl bg-white text-black font-medium hover:scale-105 transition"
          >
            Return to the Mirror
          </Link>
        </div>
      )}
    </PageShell>
  );
}
