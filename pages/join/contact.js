import PageShell from "@/components/Layout/PageShell";

export default function Contact() {
  return (
    <PageShell
      heading={{
        emoji: "📩",
        title: "Start a Scroll",
        subtitle: "If you resonate with what I build, let’s begin a conversation. Tell me what you’re creating — or what you want to feel."
      }}
    >
      <form className="mt-10 w-full max-w-xl space-y-6 mx-auto">
        <div>
          <label className="block text-sm mb-1" htmlFor="name">Your Name</label>
          <input
            id="name"
            type="text"
            placeholder="You are..."
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Where can I reach you?"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="message">Message / What are you building?</label>
          <textarea
            id="message"
            rows="5"
            placeholder="Speak your intent..."
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:scale-105 transition"
        >
          Cast the Scroll
        </button>
      </form>
    </PageShell>
  );
}
