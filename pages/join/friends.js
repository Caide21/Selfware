// pages/friends.js
import { useState } from 'react';
import Link from 'next/link';

export default function FriendsPage() {
  const [access, setAccess] = useState(false);
  const [input, setInput] = useState('');

  const correctPassword = 'FatShits'; // 🔑 Your password here

  if (!access) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-2xl mb-4">Enter Password to Unlock 🔐</h1>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Secret password..."
          className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 mb-4"
        />
        <button
          onClick={() => setAccess(input === correctPassword)}
          className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700"
        >
          Unlock
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-white flex flex-col items-center px-6 py-12">
      <h1 className="text-3xl font-bold mb-4">Yo whatsup my niggas 👊🏽</h1>
      <p className="text-lg text-gray-300 mb-6 text-center max-w-xl">
        Welcome to my editable world 🌐 — this is a private zone where I’ll post content just for us. Think of it like an underground codex.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full max-w-5xl">
        <Card title="💊 Drugs" href="/friends/drugs" description="Deep dives, protocols, and stack logs." />
        <Card title="📜 Private Scrolls" href="/friends/scrolls" description="Secret thoughts, rituals, and upgrades." />
        <Card title="🗣️ Feedback Zone" href="/friends/feedback" description="Drop comments, tweaks, or add requests." />
      </div>
    </div>
  );
}

function Card({ title, description, href }) {
  return (
    <Link href={href}>
      <div className="bg-gray-800 hover:bg-gray-700 transition rounded-2xl p-6 cursor-pointer border border-gray-600 shadow-md hover:shadow-xl">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-400">{description}</p>
      </div>
    </Link>
  );
}
