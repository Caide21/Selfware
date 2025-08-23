import Link from "next/link";
import PageShell from "@/components/Layout/PageShell";

export default function MirrorIndex() {
  return (
    <PageShell
      heading={{
        emoji: "🪞",
        title: "Welcome to The Mirror",
        subtitle:
          "This is my inner OS — part dashboard, part journal, part mirror. I track my state, reflect in real-time, and get honest about where I’m at. For now, it’s mine. But soon, it’ll be open to anyone.",
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        <Link href="/mirror/stats" className="bg-white text-black px-6 py-4 rounded-xl hover:scale-105 transition text-center">📊 Stats</Link>
        <Link href="/mirror/scroll" className="bg-white text-black px-6 py-4 rounded-xl hover:scale-105 transition text-center">📜 Cast a Scroll</Link>
        <Link href="/mirror/spellbook" className="bg-white text-black px-6 py-4 rounded-xl hover:scale-105 transition text-center">📖 Spellbook</Link>
      </div>
    </PageShell>
  );
}
