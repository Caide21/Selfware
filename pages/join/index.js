import Link from "next/link";
import PageShell from "@/components/Layout/PageShell";

export default function JoinIndex() {
  return (
    <PageShell
      heading={{
        emoji: "🤝",
        title: "Join Us",
        subtitle: "Choose how you'd like to connect or collaborate.",
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        <Link href="/join/contact" className="bg-white text-black px-6 py-4 rounded-xl hover:scale-105 transition text-center">📬 Contact</Link>
        <Link href="/join/work" className="bg-white text-black px-6 py-4 rounded-xl hover:scale-105 transition text-center">💼 Work With Us</Link>
        <Link href="/join/friends" className="bg-white text-black px-6 py-4 rounded-xl hover:scale-105 transition text-center">🧑‍🚀 Allies</Link>
        <Link href="/join/login" className="bg-white text-black px-6 py-4 rounded-xl hover:scale-105 transition text-center">🔐 Login</Link>
      </div>
    </PageShell>
  );
}
