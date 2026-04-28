type Skill = {
  label?: string;
  tier?: number;
  prerequisites?: string[];
  linkedStats?: string[];
  description?: string;
};

export interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  const prerequisites = skill.prerequisites ?? [];
  const linkedStats = skill.linkedStats ?? [];

  return (
    <div className="w-full rounded-xl border bg-black/20 px-4 py-4 shadow transition-all hover:shadow-lg sm:px-6 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold sm:text-lg">{skill.label}</h3>
        <span className="text-xs text-gray-400">Tier {skill.tier}</span>
      </div>
      {prerequisites.length > 0 && (
        <div className="text-xs text-yellow-400">
          <strong>Requires:</strong> {prerequisites.join(', ')}
        </div>
      )}
      <div className="text-xs text-blue-300">
        <strong>Stats:</strong> {linkedStats.join(', ')}
      </div>
      <div className="text-sm italic text-gray-300">{skill.description}</div>
    </div>
  );
}
