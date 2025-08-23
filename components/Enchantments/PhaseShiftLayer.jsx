export default function PhaseShiftLayer({ isIdle }) {
    if (!isIdle) return null;
  
    return (
      <div className="fixed inset-0 z-40 pointer-events-none transition-all duration-1000">
        {/* 🌈 Subtle hue drift background */}
        <div className="absolute inset-0 animate-hue-drift psy-aura blur-sm" />
  
        {/* 🔮 Peripheral sigil pulse */}
        <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-purple-400/10 blur-xl animate-sigil-pulse" />
  
        {/* 🌬️ Floating particles */}
        <div className="absolute top-1/3 left-1/4 w-6 h-6 rounded-full bg-blue-300/10 blur-md animate-float-slower opacity-40" />
        <div className="absolute top-2/3 right-1/3 w-5 h-5 rounded-full bg-pink-300/10 blur-md animate-float-slower opacity-30" />
        <div className="absolute top-1/2 left-2/3 w-4 h-4 rounded-full bg-indigo-300/10 blur-md animate-float-slower opacity-30" />
      </div>
    );
  }