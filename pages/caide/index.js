import Link from "next/link";
import PageShell from "@/components/Layout/PageShell";

export default function CaideHub() {
  return (
    <PageShell
      heading={{
        emoji: "",
        title: "About Caide",
        subtitle:
          "Who I am, what I build, and how I can help. A personal hub — clear, direct, and human.",
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
        <Link
          href="/caide/identity"
          className="bg-white/10 hover:bg-white/20 transition p-6 rounded-xl text-center"
        >
          <div className="text-3xl mb-2">🪞</div>
          <h2 className="text-lg font-semibold">Identity</h2>
          <p className="text-sm text-white/60">
            Background, strengths, and perspective
          </p>
        </Link>
        <Link
          href="/caide/about"
          className="bg-white/10 hover:bg-white/20 transition p-6 rounded-xl text-center"
        >
          <div className="text-3xl mb-2">📜</div>
          <h2 className="text-lg font-semibold">Story</h2>
          <p className="text-sm text-white/60">
            Origins, lessons, and the bigger vision
          </p>
        </Link>
        <Link
          href="/caide/services"
          className="bg-white/10 hover:bg-white/20 transition p-6 rounded-xl text-center"
        >
          <div className="text-3xl mb-2">💼</div>
          <h2 className="text-lg font-semibold">Services</h2>
          <p className="text-sm text-white/60">
            Coaching, sessions, and collaborations
          </p>
        </Link>
        <Link
          href="/caide/contact"
          className="bg-white/10 hover:bg-white/20 transition p-6 rounded-xl text-center"
        >
          <div className="text-3xl mb-2">📬</div>
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="text-sm text-white/60">
            Reach out via email or DM
          </p>
        </Link>
      </div>
    </PageShell>
  );
}
