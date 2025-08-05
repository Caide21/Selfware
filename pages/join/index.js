<<<<<<< HEAD
import Link from "next/link";
import PageShell from "@/components/Layout/PageShell";

export default function JoinIndex() {
  return (
    <PageShell
      heading={{
        emoji: "🤝",
        title: "Join the Movement",
        subtitle: "Choose how you'd like to connect or collaborate."
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        <Link href="/join/contact" className="bg-white text-black px-6 py-4 rounded-xl hover:scale-105 transition text-center">📬 Contact</Link>
        <Link href="/join/work" className="bg-white text-black px-6 py-4 rounded-xl hover:scale-105 transition text-center">💼 Work With Us</Link>
        <Link href="/join/friends" className="bg-white text-black px-6 py-4 rounded-xl hover:scale-105 transition text-center">🧑‍🚀 Allies</Link>
        <Link href="/join/login" className="bg-white text-black px-6 py-4 rounded-xl hover:scale-105 transition text-center">🔐 Login</Link>
      </div>
    </PageShell>
=======
// pages/join/index.js
import Link from "next/link";

export default function JoinIndex() {
  return (
    <main className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">🤝 Join the Movement</h1>
      <p className="text-theme-muted max-w-xl text-center mb-6">
        Choose how you'd like to connect or collaborate.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/join/contact" className="bg-white text-black px-6 py-4 rounded-xl hover:scale-105 transition">📬 Contact</Link>
        <Link href="/join/work" className="bg-white text-black px-6 py-4 rounded-xl hover:scale-105 transition">💼 Work With Us</Link>
        <Link href="/join/friends" className="bg-white text-black px-6 py-4 rounded-xl hover:scale-105 transition">🧑‍🚀 Allies</Link>
        <Link href="/join/login" className="bg-white text-black px-6 py-4 rounded-xl hover:scale-105 transition">🔐 Login</Link>
      </div>
    </main>
>>>>>>> 99cc43d (cleanup)
  );
}
