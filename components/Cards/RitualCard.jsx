export default function RitualCard({ ritual }) {
  const effects = Object.entries(ritual.effects || {}).map(
    ([stat, value]) => `${stat}: +${value}`
  ).join(", ");

  return (
    <div className="w-full rounded-xl border bg-black/20 px-4 sm:px-6 py-4 shadow hover:shadow-lg transition-all space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-base sm:text-lg font-semibold">
          {ritual.glyph} {ritual.title}
        </h3>
        <span className="text-xs text-gray-400">{ritual.type}</span>
      </div>
      <div className="text-sm text-gray-300">
        <strong>Effects:</strong> {effects}
      </div>
      <div className="text-sm text-gray-400">
        <strong>Duration:</strong> {ritual.duration}
      </div>
      <div className="text-sm italic text-gray-500">{ritual.symbolicNotes}</div>
      {ritual.phases?.length > 0 && (
        <ul className="text-xs text-gray-400 list-disc ml-5 mt-1">
          {ritual.phases.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
