import Link from "next/link";
import PageShell from "@/components/Layout/PageShell";

// Sleek, business-friendly cards (tone-only change, same structure)
const ScrollCard = ({ emoji, title, description }) => (
  <div className="theme-card p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition text-left shadow-xl backdrop-blur-sm border border-white/10">
    <div className="text-4xl mb-3" aria-hidden>{emoji}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-theme-muted text-sm">{description}</p>
  </div>
);

export default function Home() {
  return (
    <PageShell
      heading={{
        emoji: "🜔",
        title: "Selfware",
        subtitle: "A personal OS that turns your life into context you can actually use. Context = Accuracy.",
      }}
    >
      {/* Hero CTA (labels toned down, routes unchanged) */}
      <section className="min-h-[60vh] sm:min-h-[70vh] flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none animate-pulse bg-gradient-radial from-indigo-950/10 via-purple-900/10 to-transparent blur-3xl" />
        <div className="z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Your brain, but with patch notes
          </h1>
          <p className="text-theme-muted mt-4 text-base sm:text-lg">
            Track progress, see patterns, and make better decisions with clarity. Just clean context.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full items-center justify-center">
            <Link
              href="/mirror/scroll"
              className="bg-white text-black text-sm sm:text-base px-6 py-3 rounded-2xl shadow-xl hover:scale-105 transition w-full sm:w-auto text-center"
            >
              Open the Progress Tracker
            </Link>
            <Link
              href="/codex"
              className="border border-white text-sm sm:text-base px-6 py-3 rounded-2xl hover:bg-white/10 transition w-full sm:w-auto text-center"
            >
              Browse Playbooks
            </Link>
          </div>
        </div>
      </section>

      {/* System Components (outer lexicon) */}
      <section className="py-20 px-6">
        <h2 className="text-4xl font-semibold text-center mb-12">⚡ What You Get</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ScrollCard
            emoji="📈"
            title="Progress Tracker"
            description="Level up like a game. Goals, reps, reflections — all in one clean timeline."
          />
          <ScrollCard
            emoji="📚"
            title="Playbooks"
            description="Simple, reusable templates for decisions, habits, and projects. Less guessing, more doing."
          />
          <ScrollCard
            emoji="🧠"
            title="Skill Map"
            description="See your real strengths and gaps. Build the next capability on purpose, not by accident."
          />
          <ScrollCard
            emoji="📶"
            title="Signal Engine"
            description="Turn noisy days into readable signals. Spot patterns in mood, energy, and results."
          />
          <ScrollCard
            emoji="👤"
            title="About Caide"
            description="Why this exists, what shaped it, and where it’s going."
          />
          <ScrollCard
            emoji="🤝"
            title="Work With Us"
            description="Coaching, setup, or custom builds. Start simple, scale as you go."
          />
        </div>
      </section>

      {/* Who It's For (outer tone) */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-4xl font-semibold mb-4">Who Is This For?</h2>
        <p className="text-theme-muted max-w-2xl mx-auto mb-10">
          Builders, operators, and learners who want fewer tabs in their head. If you like clear dashboards,
          lightweight systems, and seeing compounding progress, you’ll feel at home.
        </p>
        <div className="text-2xl italic text-white/80 mb-2">Run your life like it matters — with context.</div>
        <div className="text-sm text-white/40">Early build. Real utility. Zero fluff.</div>
      </section>
    </PageShell>
  );
}
