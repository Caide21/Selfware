export default function ScrollCard({ title, blocks }) {
  return (
    <div className="theme-scroll-card w-full rounded-xl px-4 sm:px-6 py-4 sm:py-6 space-y-3 bg-black text-white">
      <h2 className="text-base sm:text-lg font-semibold">{title}</h2>
      <BlockRenderer blocks={blocks} />
    </div>
  );
}
