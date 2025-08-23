export default function EmotionCard({ emotion }) {
  return (
    <div className="w-full rounded-xl border bg-black/20 px-4 sm:px-6 py-4 shadow hover:shadow-lg transition-all space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-base sm:text-lg font-semibold">
          {emotion.symbol} {emotion.name}
        </h3>
        <span className="text-xs text-gray-400">Intensity: {emotion.intensity}/10</span>
      </div>
      <div className="text-sm text-gray-300">
        <strong>Source:</strong> {emotion.source}
      </div>
    </div>
  );
}
