export default function StatCard({ stat }) {
  const percent = Math.round((stat.xp / stat.maxXP) * 100);
  const tierColors = {
    Dormant: "bg-gray-500",
    Fogged: "bg-gray-600",
    Flickering: "bg-yellow-600",
    Stirring: "bg-amber-600",
    Sharpened: "bg-blue-600",
    Resonant: "bg-purple-600",
    Radiant: "bg-pink-600",
    Mythic: "bg-gradient-to-r from-pink-500 to-indigo-500 animate-pulse"
  };

  return (
    <div className="w-full rounded-2xl px-4 sm:px-6 py-4 border bg-black/20 shadow-md space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-base sm:text-xl font-semibold">{stat.label}</h2>
        <span className={`text-sm font-medium ${tierColors[stat.tier] || ""}`}>
          {stat.tier} (Lv. {stat.tierLevel})
        </span>
      </div>
      <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${tierColors[stat.tier] || "bg-gray-400"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-sm text-gray-300">
        {stat.xp} / {stat.maxXP} XP — {stat.descriptor}
      </div>
    </div>
  );
}
