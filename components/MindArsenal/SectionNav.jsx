export default function SectionNav({ sections, activeId, onSelect }) {
  return (
    <div className="space-y-2">
      {sections.map((section) => {
        const isActive = section.id === activeId;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className={`w-full text-left px-3 py-2 rounded-lg border transition ${
              isActive
                ? 'border-purple-400 bg-purple-500/10 text-white shadow-lg shadow-purple-500/20'
                : 'border-white/10 hover:border-purple-400/60 hover:bg-purple-500/5 text-white/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{section.icon}</span>
              <div>
                <div className="font-semibold">{section.label}</div>
                <p className="text-xs text-white/60">{section.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
