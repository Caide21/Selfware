import BlockRenderer from "@/components/BlockRenderer";

export default function CodexPage({ title, blocks }) {
  return (
    <main className="min-h-screen bg-black text-white flex justify-center items-start px-4 sm:px-12 py-12">
      <div className="w-full max-w-3xl bg-black/50 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8 sm:p-12 shadow-lg relative overflow-hidden">

        {/* Subtle purple outer glow */}
        <div className="absolute inset-0 rounded-2xl border border-purple-500/20 pointer-events-none" />
        <div className="absolute -inset-2 rounded-3xl bg-purple-600 opacity-10 blur-2xl pointer-events-none" />

        <h1 className="text-4xl font-bold mb-6">{title}</h1>
        <BlockRenderer blocks={blocks} />
      </div>
    </main>
  );
}
